import fs from 'fs-extra'
import path from 'path'

export async function buildCss(src, dest, opts) {
  const postcss = (await import('postcss')).default
  const postcssImport = (await import('postcss-import')).default
  const postcssNested = (await import('postcss-nested')).default
  const postcssCustomMedia = (await import('postcss-custom-media')).default
  const autoprefixer = (await import('autoprefixer')).default
  const cssnano = (await import('cssnano')).default

  const { css, map } = await postcss(
    [postcssImport, postcssNested, postcssCustomMedia, autoprefixer, opts.minify && cssnano].filter(Boolean)
  ).process(await fs.readFile(src.filepath), { from: src.filepath, to: dest.filepath })

  await fs.outputFile(dest.filepath, css)
  if (map && opts.sourcemap) await fs.outputFile(dest.filepath + '.map', map.toString())

  const prettyname = dest.filepath.replace(process.cwd(), '').replace(/^\//, '')

  console.log(`\n  > ${prettyname} ${fs.statSync(dest.filepath).size * 0.001}kb`)
}

export async function buildJs(src, dest, opts) {
  const esbuild = (await import('esbuild')).default
  const outfile = path.resolve(dest.dirname, dest.filename + '.js')

  await esbuild.build({
    entryPoints: [src.filepath],
    outfile,
    format: opts.format,
    globalName: opts.global,
    bundle: true,
    minify: opts.minify,
    sourcemap: true,
  })

  const prettyname = outfile.replace(process.cwd(), '').replace(/^\//, '')

  if (opts.legacy) {
    const { transform } = await import('@babel/core')

    await new Promise(async (y, n) => {
      transform(
        await fs.readFile(outfile),
        {
          filename: path.basename(src.filepath),
          presets: ['@babel/preset-env'],
        },
        async (e, { code, map }) => {
          if (e) return n(e)

          await fs.outputFile(outfile, esbuild.transformSync(code, { minify: true }).code)
          if (map && opts.sourcemap) await fs.outputFile(outfile + '.map', map.toString())

          console.log(`\n  > ${prettyname} ${fs.statSync(outfile).size * 0.001}kb`)

          y(1)
        }
      )
    })
  } else {
    console.log(`\n  > ${prettyname} ${fs.statSync(outfile).size * 0.001}kb`)
  }
}

export function grokFile(filepath) {
  const cwd = process.cwd()
  const absolute = path.join(cwd, filepath)
  const extname = path.extname(absolute)
  const filename = path.basename(absolute, extname)
  const dirname = path.dirname(absolute)
  return {
    filepath: absolute,
    filename,
    dirname,
    extname,
  }
}
