import storeService from './stores'
import aisleService from './storeAisles'
import sectionService from './storeSections'

const verboseLogging = false

// I'm not proud of this. But it's late.
// And apparently this is the system I accidently designed. Whoops.
const addOrUpdateFullStore = async (store) => {
    const storeResult = await addOrUpdateStore(store)
    if (!storeResult.success) {
        console.error('Failed to add or update root store!')
        return { success: false }
    }

    const storeId = store.id ? store.id : storeResult.store.id
    const aislesResult = await addOrUpdateAisles(storeId, store)
    if (!aislesResult.success) {
        console.error('Failed to add or update aisles!')
        return { success: false }
    }

    return { success: true } // whew
}

const addOrUpdateStore = async (store) => {
    if (Number.isInteger(store.id)) {
        return await storeService.updateStore(store)
    } else {
        return await storeService.addStore(store)
    }
}

const isNotIn = (arr, aisle) => !arr.some((x) => x.id === aisle.id)

const isInAndChanged = (arr, aisle) => {
    const existingAisle = arr.find((x) => x.id === aisle.id)
    if (existingAisle) {
        // todo: this is brittle
        const isChanged = aisle.name !== existingAisle.name || aisle.position !== existingAisle.position
        if (verboseLogging) console.log('Is Aisle Changed?', aisle, existingAisle, isChanged)
        return isChanged
    }
    return false
}

const addOrUpdateAisles = async (storeId, store) => {
    const curAislesResult = await aisleService.getAisles(storeId, true)
    if (!curAislesResult.success) {
        console.error('Failed to fetch current aisles for store.')
        return { success: false }
    }

    const curAisles = curAislesResult.aisles
    const newAisles = store.aisles.map((aisle, index) => ({ ...aisle, position: index }))

    const addPromises = newAisles
        .filter((aisle) => isNotIn(curAisles, aisle))
        .map((aisle) => ({ promise: aisleService.addAisle(storeId, aisle), oldId: aisle.id }))

    const updatePromises = newAisles
        .filter((aisle) => isInAndChanged(curAisles, aisle))
        .map((aisle) => aisleService.updateAisle(storeId, aisle))

    const deletePromises = curAisles
        .filter((aisle) => isNotIn(newAisles, aisle))
        .map((aisle) => aisleService.deleteAisle(storeId, aisle.id))

    const addResults = await Promise.all(addPromises.map((x) => x.promise))
    const updateResults = await Promise.all(updatePromises)
    const deleteResults = await Promise.all(deletePromises)

    if (
        !addResults.every((result) => result.success) ||
        !updateResults.every((result) => result.success) ||
        !deleteResults.every((result) => result.success)
    ) {
        console.error('One of these failed...', addResults, updateResults, deleteResults)
        return { success: false }
    }

    console.info('Aisle Updates', addResults, updateResults, deleteResults)

    // NB: because I give my 'new aisles' fake ids I need to map the oldId to the promise with the new id
    const newAislesWithIds = newAisles.map((aisle) => {
        const addIndex = addPromises.findIndex((x) => x.oldId === aisle.id)
        if (addIndex !== -1) {
            const addResult = addResults[addIndex]
            return { ...aisle, id: addResult.aisle.id }
        }

        return aisle
    })

    return await setAllSections(storeId, newAislesWithIds, curAisles)
}

const arrEqual = (arr1, arr2) => arr1.length === arr2.length && arr1.every((x) => arr2.includes(x))

const isNotInOrIsChanged = (arr, aisle) => {
    const existingAisle = arr.find((x) => x.id === aisle.id)
    if (existingAisle) {
        const isChanged = !arrEqual(aisle.sections, existingAisle.sections)
        if (verboseLogging) console.log('Is Sections Changed?', aisle.sections, existingAisle.sections, isChanged)
        return isChanged
    }

    return true
}

const setAllSections = async (storeId, newAisles, curAisles) => {
    const promises = newAisles
        .filter((aisle) => isNotInOrIsChanged(curAisles, aisle))
        .map((aisle) => sectionService.setAllSections(storeId, aisle.id, aisle.sections))

    const results = await Promise.all(promises)

    if (!results.every((result) => result.success)) {
        console.error('One of these failed...', results)
        return { success: false }
    }

    console.log('Section Updates', results)

    return { success: true } // whew
}

const storesServiceHelper = { addOrUpdateFullStore }
export default storesServiceHelper
