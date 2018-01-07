export default abstract class Serializable {
  abstract serialize(): object

  json(): string {
    return JSON.stringify(this.serialize())
  }
}
