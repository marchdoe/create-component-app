#!/usr/bin/env node

import inquirer from 'inquirer'
import yargs from 'yargs'

import Logger from './logger'
import {
  generateFiles,
  generateFilesFromTemplate,
  generateFilesFromCustom,
} from './files'
import {
  generateQuestions,
  getTemplatesList,
  getConfig,
  getTemplate,
} from './utils'

import { questions } from './questions'

const args = yargs.argv
const config = getConfig(args.config)

async function startTemplateGenerator() {
  try {
    const templatesDirPath = config ? config.templatesDirPath : null
    const templates = getTemplatesList(templatesDirPath)
    const templatesPath = await getTemplate(templates, args.template)

    const requiredAnswers = await inquirer.prompt([
      questions.name,
      questions.path,
    ])

    const results = {
      ...config,
      ...requiredAnswers,
      templatesPath,
    }

    generateFilesFromTemplate(results)
    Logger.log('Your component is created!')
  } catch (error) {
    Logger.error(error.message)
  }
}

/**
 * Start the process to generate component folder and files:
 * Filter question by config file
 * Get from the user the requirements to create the component folder and files
 * Generate files
 */
(async function start() {
  try {
    if (args.template) {
      return await startTemplateGenerator()
    }

    const { template } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'template',
        message: 'Do you wanna choose a template',
        default: false,
      },
    ])

    if (template) {
      return await startTemplateGenerator()
    }

    const filteredQuestions = generateQuestions(config, questions)
    const requirements = await inquirer.prompt(filteredQuestions)
    const results = {
      ...config,
      ...requirements,
    }

    if (results.type === 'custom') {
      await generateFilesFromCustom(results)
    } else {
      await generateFiles(results)
    }
    Logger.log('Your component is created!')
  } catch (e) {
    Logger.error(e.message)
  }
  return null
}())

export default { generateFiles, generateFilesFromCustom }
