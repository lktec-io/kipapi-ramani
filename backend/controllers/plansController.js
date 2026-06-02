import * as Plan from '../models/planModel.js'
import fs from 'fs'

export const getPlans = async (req, res, next) => {
  try {
    const { bedrooms, stories, style, minPrice, maxPrice, search } = req.query
    const plans = await Plan.getAllPlans({ bedrooms, stories, style, minPrice, maxPrice, search })
    res.json(plans)
  } catch (err) {
    next(err)
  }
}

export const getPlan = async (req, res, next) => {
  try {
    const plan = await Plan.getPlanById(req.params.id)
    if (!plan) return res.status(404).json({ message: 'Plan not found' })
    res.json(plan)
  } catch (err) {
    next(err)
  }
}

export const createPlan = async (req, res, next) => {
  try {
    const { title, description, price, bedrooms, bathrooms, stories, plot_size, style } = req.body

    if (!title || !price || !bedrooms) {
      return res.status(400).json({ message: 'title, price, and bedrooms are required' })
    }
    if (!req.files?.thumbnail?.[0] || !req.files?.secure_file?.[0]) {
      return res.status(400).json({ message: 'Both a thumbnail image and a plan file are required' })
    }

    const thumbnail_url   = `/uploads/thumbnails/${req.files.thumbnail[0].filename}`
    const secure_file_path = req.files.secure_file[0].path

    const id = await Plan.createPlan({
      title, description, price, bedrooms, bathrooms, stories,
      plot_size, style, thumbnail_url, secure_file_path,
    })

    res.status(201).json({ id, message: 'Plan created successfully' })
  } catch (err) {
    next(err)
  }
}

export const updatePlan = async (req, res, next) => {
  try {
    const affected = await Plan.updatePlan(req.params.id, req.body)
    if (!affected) return res.status(404).json({ message: 'Plan not found' })
    res.json({ message: 'Plan updated' })
  } catch (err) {
    next(err)
  }
}

export const deletePlan = async (req, res, next) => {
  try {
    const affected = await Plan.softDeletePlan(req.params.id)
    if (!affected) return res.status(404).json({ message: 'Plan not found' })
    res.json({ message: 'Plan removed from listing' })
  } catch (err) {
    next(err)
  }
}
