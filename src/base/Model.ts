import SuperModel from './SuperModel'

export interface ModelProps {
  id?: number
}

export default abstract class Model extends SuperModel {
  constructor(props: ModelProps) {
    super()
    this.id = props.id
  }
}
