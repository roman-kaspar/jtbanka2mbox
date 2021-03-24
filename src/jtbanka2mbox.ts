export class Client {
  public run(cmdLineArgs: string[]): void {
    console.log(`cmdLineArgs: ${JSON.stringify(cmdLineArgs, null, 4)}`);
  }
}
