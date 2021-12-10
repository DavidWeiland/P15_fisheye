const fs = require('fs')
const Media = require('../models/Media')

exports.createMedia = (req, res, next) => {
  const mediaObject = JSON.parse(req.body.thing)
  console.log(mediaObject)
  delete mediaObject._id
  const media = new Media({
    ...mediaObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  })
  media.save()
    .then(() => res.status(201).json({message : 'Media created !' }))
    .catch(error => res.status(400).json({ error }))
}

exports.getAllMediaOfOnePhotographer = (req, res, next) => {
  Media.find({ photographerId: req.params.photographerId })
    .then(medias => res.status(200).json(medias))
    .catch(error => res.status(400).json({ error }))
}

exports.getOneMedia = (req, res, next) => {
  Media.findOne({ _id: req.params.id })
  .then((media) => res.status(200).json(media))
  .catch(error=> res.status(400).json({error}))
}
exports.modifyOneMedia = (req, res, next) => {
  const mediaObject = req.file ? {
    ...JSON.parse(req.body.thing),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body }
  Media.updateOne({ _id: req.params.id },{...mediaObject, _id:req.params.id})
  .then(() => res.status(200).json({message:'Media modified !'}))
  .catch(error=> res.status(400).json({error}))
}

exports.deleteOneMedia = (req, res, next) => {
  Media.findOne({ _id: req.params.id })
    .then(thing => {
      if (!thing) {
        return res.status(404).json({
          error: new Error('Media not found')
        })
      }
      if (thing.userId !== req.auth.userId) {
        return res.status(401).json({
          error: new Error('request non authorized')
        })
      }
      const filename = thing.imageUrl.split('/images/')[1]
      fs.unlink(`images/${filename}`, () => {
        Media.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({message: 'Media deleted !'}))
          .catch((error) => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
  
}