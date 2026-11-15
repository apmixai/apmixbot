// The first start: where the app keeps its data and the Bots' files. The answers are kept in
// the app's own data.
import { app, dialog } from 'electron'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'
import { within } from './copy-tree.mjs'
import { installFolder } from './move-data.mjs'

const TEXT = {
  welcome: 'Welcome to ApmixBot',
  places: (data, workspace) => `Data: ${data}\nTeam workspace: ${workspace}`,
  start: 'Start', change: 'Change…', quit: 'Quit',
  pickData: 'Folder for ApmixBot data', pickWorkspace: 'Folder for the team workspace',
  dataInWorkspace: 'The data folder cannot be inside the team workspace.',
  workspaceInData: 'The team workspace cannot be inside the data folder.',
  inProgram: 'Choose a folder outside the program folder: uninstalling removes it.',
  pickMove: 'New folder for ApmixBot data',
  moveDrive: 'Choose a folder, not a whole drive.',
  moveNested: 'Choose a folder outside the current data folder.',
  moveWorkspace: 'The data folder and the team workspace cannot hold each other.',
  moveNotEmpty: 'Choose an empty folder or a new one.',
  moveConfirm: to => `Move ApmixBot's data to ${to}?`,
  moveDetail: from => `ApmixBot copies its data there and starts again. ${from} stays as it is; you can delete it once everything works.`,
  move: 'Move and restart', cancel: 'Cancel',
  moving: 'Copying ApmixBot\'s data…',
  starting: 'Starting ApmixBot…',
  moveInUse: 'Another ApmixBot is using this data, so it was not moved. Close it, then try again.',
  moveFailed: message => `The data could not be copied: ${message}\n\nApmixBot goes on with its data where it was.`,
  notStarted: 'ApmixBot could not start.',
}
export const text = () => TEXT

const locationsFile = () => join(app.getPath('userData'), 'locations.json')

// A quit request while a first-run dialog is open stops the first run right after that dialog.
class Quit extends Error {}

async function ask(options, signal) {
  const { response } = await dialog.showMessageBox({ title: 'ApmixBot', noLink: true, ...options, signal })
  // A quit that arrived while a synchronous macOS box was open gets to run first.
  await new Promise(resolve => setImmediate(resolve))
  if (signal.aborted) throw new Quit()
  return response
}

async function pick(title, current, signal) {
  const { canceled, filePaths } = await dialog.showOpenDialog({ title, defaultPath: existsSync(current) ? current : dirname(current), properties: ['openDirectory', 'createDirectory', 'promptToCreate'] })
  await new Promise(resolve => setImmediate(resolve))
  if (signal.aborted) throw new Quit()
  return canceled ? current : filePaths[0]
}

export const programFolder = () => installFolder(app.getPath('exe'))

function placeProblem(t, dataDir, workspace) {
  const program = programFolder()
  if (within(dataDir, workspace)) return t.dataInWorkspace
  if (within(workspace, dataDir)) return t.workspaceInData
  for (const path of [dataDir, workspace]) {
    if (app.isPackaged && within(path, program)) return t.inProgram
  }
  return undefined
}

/** Write the chosen places once the first run is finished; quitting before that asks again. */
export function saveLocations({ dataDir, workspace }) {
  const file = locationsFile()
  mkdirSync(dirname(file), { recursive: true })
  // A write that fails half way leaves the places that were there.
  writeFileSync(`${file}.tmp`, `${JSON.stringify({ dataDir, workspace }, null, 2)}\n`)
  renameSync(`${file}.tmp`, file)
}

/**
 * Where the app keeps its data and the Bots' files, asked at the first start.
 * A run on throwaway folders (APMIXBOT_HOME, for development and tests) asks nothing.
 * @returns {Promise<{ dataDir: string, workspace?: string, quit?: true, fresh?: true }>} `fresh`: just chosen, not saved yet
 */
export async function chooseLocations(signal) {
  if (process.env.APMIXBOT_HOME) return { dataDir: process.env.APMIXBOT_HOME, workspace: process.env.APMIXBOT_WORKSPACE || undefined }
  const file = locationsFile()
  if (existsSync(file)) {
    const saved = JSON.parse(readFileSync(file, 'utf8'))
    return { dataDir: saved.dataDir, workspace: saved.workspace }
  }
  const t = text()
  let dataDir = join(homedir(), '.apmixbot')
  let workspace = join(homedir(), 'ApmixBot')
  try {
    for (;;) {
      const choice = await ask({ type: 'info', message: t.welcome, detail: t.places(dataDir, workspace), buttons: [t.start, t.change, t.quit], defaultId: 0, cancelId: 2 }, signal)
      if (choice === 2) return { quit: true }
      if (choice === 1) {
        dataDir = await pick(t.pickData, dataDir, signal)
        workspace = await pick(t.pickWorkspace, workspace, signal)
        continue
      }
      const problem = placeProblem(t, dataDir, workspace)
      if (problem === undefined) break
      await ask({ type: 'warning', message: problem, buttons: ['OK'] }, signal)
    }
  } catch (error) {
    if (error instanceof Quit) return { quit: true }
    throw error
  }
  // The caller saves the choice once the data folder could be made: saved first, a folder
  // the app cannot write would fail every later start without asking again.
  return { dataDir, workspace, fresh: true }
}
