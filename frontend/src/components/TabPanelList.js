import * as React from 'react'
import { Box, List, Tab, Tabs } from '@mui/material'

const TabPanel = (props) => {
    const { children, value, index, ...other } = props

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    )
}

const TabPanelList = ({ value, updateIndex, tabs, options, optionInTab, optionToElement }) => {
    return (
        <>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs
                    value={value}
                    onChange={(event, newValue) => updateIndex(newValue)}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.name} />
                    ))}
                </Tabs>
            </Box>
            {tabs.map((tab, index) => (
                <TabPanel key={index} value={value} index={index}>
                    <List>
                        {options.filter((option) => optionInTab(option, tab)).map((option) => optionToElement(option))}
                    </List>
                </TabPanel>
            ))}
        </>
    )
}

export default TabPanelList
