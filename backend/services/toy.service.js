const fs = require('fs')
var toys = require('../data/toy.json')

function query(filterBy = {}, sortBy = {}) {
    let toysToDisplay = toys

    // FILTER:

    if (filterBy.inStock)
        toysToDisplay = toysToDisplay.filter(toy => toy.inStock)

    if (filterBy.name) {
        const regExp = new RegExp(filterBy.name, 'i')
        toysToDisplay = toysToDisplay.filter(toy => regExp.test(toy.name))
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        toysToDisplay = toysToDisplay.filter(toy => {
            return toy.labels.some(label => filterBy.labels.includes(label))
        })
    }

    // SORT:
    if (sortBy.type) {
        toysToDisplay = getSortedToys(toysToDisplay, sortBy)
    }

    return Promise.resolve(toysToDisplay)
}

function getSortedToys(toysToDisplay, sortBy) {
    toysToDisplay.sort((b1, b2) => {
        if (sortBy.type === 'name') {
            return sortBy.desc * b1[sortBy.type].localeCompare(b2[sortBy.type])
        } else {
            return sortBy.desc * (b2[sortBy.type] - b1[sortBy.type])
        }
    })
    return toysToDisplay
}

function get(toyId) {
    const toy = toys.find(toy => toy._id === toyId)
    if (!toy) return Promise.reject('Toy not found!')
    return Promise.resolve(toy)
}

function remove(toyId, loggedinUser) {
    const idx = toys.findIndex(toy => toy._id === toyId)
    if (idx === -1) return Promise.reject('No Such Toy')
    const toy = toys[idx]
    // if (toy.owner._id !== loggedinUser._id) return Promise.reject('Not your toy')
    toys.splice(idx, 1)
    return _saveToysToFile()

}

function save(toy) { // add  loggedinUser if want to use owner
    if (toy._id) {
        const toyToUpdate = toys.find(currToy => currToy._id === toy._id)
        // if (toyToUpdate.owner._id !== loggedinUser._id) return Promise.reject('Not your toy') // remove *//* if want to use owner
        toyToUpdate.name = toy.name
        toyToUpdate.price = toy.price
        toyToUpdate.labels = toy.labels
        toyToUpdate.createdAt = toy.createdAt
        toyToUpdate.inStock = toy.inStock
    } else {
        toy._id = _makeId()
        toy.imgUrl = _setImg(toy.labels)
        // toy.owner = loggedinUser // remove *//* if want to use owner
        toys.push(toy)
    }

    return _saveToysToFile().then(() => toy)
    // return Promise.resolve(toy)
}

function _makeId(length = 5) {
    let text = ''
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
}

function _setImg(labels) {
    let picNum
    picNum = _getRandomIntInclusive(1, 4) * 10 // radom category
    picNum += _getRandomIntInclusive(0, 2)     // radom pic in a category

    if (!labels || labels.length < 1) { // no labels picked >>> random pic
        return `${picNum}.jpg`
    }
    else { // if label picked >>> set pic by category
        if (labels.some(label => label === 'On wheels')) {
            picNum = _getRandomIntInclusive(1, 3)
        }
        else if (labels.some(label => label === 'Box game')) {
            picNum = _getRandomIntInclusive(10, 12)
        }
        else if (labels.some(label => label === 'Baby' || 'Doll' || 'Outdoor')) {
            picNum = _getRandomIntInclusive(20, 22)
        }
        else if (labels.some(label => label === 'Puzzle')) {
            picNum = _getRandomIntInclusive(30, 32)
        }
        else if (labels.some(label => label === 'Art')) {
            picNum = _getRandomIntInclusive(40, 42)
        }

        return `${picNum}.jpg`
    }
}

function _saveToysToFile() {
    return new Promise((resolve, reject) => {

        const toysStr = JSON.stringify(toys, null, 2)
        fs.writeFile('data/toy.json', toysStr, (err) => {
            if (err) {
                return console.log(err)
            }
            console.log('The file was saved!')
            resolve()
        })
    })
}

function _getRandomIntInclusive(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min + 1)) + min //The maximum is inclusive and the minimum is inclusive 
}

module.exports = {
    query,
    get,
    remove,
    save
}