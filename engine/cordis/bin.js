#!/usr/bin/env node

import { Context } from '@apmixbot/cordis'
import { pathToFileURL } from 'node:url'
import Loader from '@apmixbot/cordis-plugin-loader'

const ctx = new Context()
ctx.baseUrl = pathToFileURL(process.cwd()).href + '/'

await ctx.plugin(Loader)
await ctx.loader.create({
  name: '@apmixbot/cordis-plugin-include',
  config: {
    path: './cordis.yml',
  },
})
