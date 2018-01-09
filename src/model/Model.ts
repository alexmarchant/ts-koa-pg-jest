import * as ModelStorage from './ModelStorage'

export type ModelLifecycle = 'create' | 'save'

export type Validation = <T extends Model>(
  obj: T,
  property: keyof T
) => boolean

export type LifeCycleValidations = {[lifecycle: string]: Validation[]}

export type Validations = {[property: string]: LifeCycleValidations}

export interface ModelProps {
  id?: number
}

export default class Model implements ModelProps {
  static tableFields: string[]
  static tableName: string
  id?: number
  validations: Validations = {}
  errors: string[] = []
  'constructor': typeof Model

  constructor(props: Partial<ModelProps> = {}) {
    this.id = props.id
  }

  // Persistance

  async save(): Promise<boolean> {
    const lifecycle = this.lifecycle()
    if (!this.valid(lifecycle)) { return false }
    switch (lifecycle) {
      case 'create':
        await this.beforeCreate()
        break
      case 'save':
        await this.beforeSave()
        break
    }
    try {
      return await ModelStorage.save(this)
    } catch(err) {
      this.handleQueryError(err)
      return false
    }
  }

  async destroy(): Promise<boolean> {
    try {
      return ModelStorage.destroy(this)
    } catch(err) {
      this.handleQueryError(err)
      return false
    }
  }

  async beforeCreate(): Promise<void> { return }

  async beforeSave(): Promise<void> { return }

  handleQueryError(err: Error): void {}

  persistProperties(): ModelProps { return {} }

  lifecycle(): ModelLifecycle {
    if (this.persisted()) {
      return 'save'
    } else {
      return 'create'
    }
  }

  persisted(): boolean {
    return this.id ? true : false
  }

  // Validation

  valid(lifecycle: ModelLifecycle = 'save'): boolean {
    this.errors = []
    let valid = true

    // Runs all validations and returns false
    // if any validation returned false
    for (let property in this.validations) {
      for (let propLifecycle in this.validations[property]) {
        if (lifecycle !== propLifecycle) { continue }

        let funcs = this.validations[property][propLifecycle]
        for (let func of funcs) {
          if (!func(this, property as keyof this)) {
            valid = false
          }
        }
      }
    }

    return valid
  }

  // Serialization
  //
  serialize(): object { return {} }

  json(): string {
    return JSON.stringify(this.serialize())
  }
}
