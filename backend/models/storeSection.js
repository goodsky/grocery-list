const db = require('../utils/db')
const aisleDb = require('./storeAisle')

const tablename = 'storeSection'
const aisleIdColumn = 'aisleId'
const nameColumn = 'name'

let hasInit = false
const init = async () => {
    if (!hasInit) {
        await db.createTable(
            tablename,
            {
                [aisleIdColumn]: `INTEGER REFERENCES ${aisleDb.tablename}(${aisleDb.primaryKey})`,
                [nameColumn]: 'TEXT',
            },
            { UNIQUE: `(${aisleIdColumn}, ${nameColumn})` }
        )

        hasInit = true
    }
}

const convertRowToSection = (row) => {
    if (!row) {
        return null
    }

    return row[nameColumn]
}

const addSection = async (section) => {
    await init()

    const newSection = await db.insert(tablename, {
        values: {
            [aisleIdColumn]: section.aisleId,
            [nameColumn]: section.name,
        },
        returning: [aisleIdColumn, nameColumn],
    })

    return convertRowToSection(newSection)
}

const deleteSection = async ({ aisleId, name }) => {
    await init()

    await db.removeSingle(tablename, { filters: { [aisleIdColumn]: aisleId, [nameColumn]: name } })
}

const deleteSectionByAisleId = async (aisleId) => {
    await init()

    await db.remove(tablename, { filters: { [aisleIdColumn]: aisleId } })
}

const getAllSections = async () => {
    await init()

    const result = await db.query(`SELECT DISTINCT ${nameColumn} FROM ${tablename}`)
    const sections = result.rows

    return sections.map((row) => convertRowToSection(row))
}

const getSectionsByAisleId = async (aisleId) => {
    await init()

    const sections = await db.select(tablename, {
        columns: [aisleIdColumn, nameColumn],
        filters: { [aisleIdColumn]: aisleId },
    })
    return sections.map((row) => convertRowToSection(row))
}

module.exports = {
    tablename,
    addSection,
    deleteSection,
    deleteSectionByAisleId,
    getAllSections,
    getSectionsByAisleId,
}
