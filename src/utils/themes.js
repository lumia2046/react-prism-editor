const themes = ['default', 'coy', 'dark', 'funky', 'okaidia', 'solarizedlight', 'tomorrow', 'twilight']
    .map(item => {
        const result = { title: item, srcName: `prism-${item}` }
        if (item === 'default') {
            result.srcName = 'prism'
        }
        return result
    })

export default themes