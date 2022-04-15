#! /usr/bin/env node

import fs from 'fs'
import sade from 'sade'

import { grokFile, buildCss, buildJs } from './index.mjs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))
const prog = sade('chefs-kiss <src> <dest>', true)

prog
  .version(pkg.version)
  // .option('-c, --config', 'Provide path to custom config', 'spaghetti.config.js')
  .option('-f, --format', 'Format: iife, cjs, esm', 'iife')
  .option('-g, --global', 'Specify a global name e.g. window[name]', undefined)
  .option('-m, --minify', 'Minify', true)
  .option('-s, --sourcemap', 'Output a sourcemap', true)
  .option('-l, --legacy', 'Support legacy browsers', false)

prog
  .example('src/index.js build/index.js')
  .example('app/style.css public/style.css')
  .action(async (src, dest, opts) => {
    console.log(`\n  spaghetti v${pkg.version}`)
    src = grokFile(src)
    dest = grokFile(dest)

    const then = Date.now()

    await (src.extname === '.css' ? buildCss(src, dest, opts) : buildJs(src, dest, opts))

    console.log(`\n  made spaghetti in ${Date.now() - then}ms\n`)
  })

prog.parse(process.argv)
