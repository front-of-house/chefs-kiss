#! /usr/bin/env node

import { execa } from 'execa'
;(async () => {
  try {
    const [i, ...rest] = process.argv.slice(2)
    const watch = rest.find((arg) => arg.includes('-w') || arg.includes('--watch'))

    await execa(
      'postcss',
      [
        i,
        `--verbose`,
        `-u=postcss-import`,
        `-u=postcss-nested`,
        `-u=postcss-custom-media`,
        `-u=autoprefixer`,
        !watch && `-u=cssnano`,
        ...rest,
      ].filter(Boolean),
      {
        preferLocal: true,
        stdio: 'inherit',
      }
    )
  } catch (e) {
    console.error(e)
  }
})()
