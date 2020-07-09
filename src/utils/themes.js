export const basicThemes = ['default', 'coy', 'dark', 'funky', 'okaidia', 'solarizedlight', 'tomorrow', 'twilight']

export const themes = basicThemes
    .map(item => {
        const result = { title: item, srcName: `prism-${item}` }
        if (item === 'default') {
            result.srcName = 'prism'
        }
        return result
    })