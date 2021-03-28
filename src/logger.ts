import printf from 'printf';

export enum Err {
  CMD_ARG_MISSING = 'mandatory command line argument "%s" is missing',

  CANNOT_READ_CFG_FILE = 'cannot read configuration file "%s"',
  CANNOT_PARSE_CFG_FILE = 'cannot parse configuration file "%s"',
  INVALID_CFG_FILE_FORMAT = 'invalid format of configuration file "%s"',
  INVALID_CFG_FILE_ENTRY = 'invalid entry "%s" in configuration file "%s" (string expected)',
  CFG_FILE_LOADED = 'configuration file "%s" successfully parsed\n',

  NO_XML_FILES_FOUND = 'no file with prefix "%s" found in current directory',
  CANNOT_READ_XML_FILE = 'cannot read XML file "%s"',
  CANNOT_PARSE_XML_FILE = 'cannot parse XML file "%s"',
  INVALID_XML_FILE_FORMAT = 'invalid format of XML file "%s" (entries not found)',
  CANNOT_PROCESS_XML_ENTRY = 'cannot process "%s" field of entry number %d in XML file "%s"',
  XML_FILE_LOADED = 'XML file "%s" successfully parsed',

  CANNOT_MAP_CODE = 'cannot map end-to-end code "%s" of entry number %d in XML file "%s"',

  CANNOT_WRITE_FILE = 'cannot write CSV file "%s"',
  OUT_FILE_WRITTEN = 'output file "%s" written with \x1b[36m%d\x1b[0m %s\n',
}

export class Logger {
  private firstOutput = true;

  private message(fatal: boolean, prefix: string, err: Err, ...rest): void {
    if (this.firstOutput) {
      console.log('');
    }
    this.firstOutput = false;
    console.log(`${prefix} ${printf(err, ...rest)}`);
    if (fatal) {
      console.log(`
\x1b[36musage:\x1b[0m ./bin/jtbanka2mbox --in <XML_FILENAMES_PREFIX> --out <CSV_FILENAME> [--config <MAPPING_FILENAME>]
for more details, please see \x1b[36mREADME.md\x1b[0m
`);
      process.exit(1);
    }
  }

  public error(err: Err, ...rest): void {
    this.message(true, '\x1b[31merror:\x1b[0m', err, ...rest);
  }

  public warning(err: Err, ...rest): void {
    this.message(false, '\x1b[33mwarning:\x1b[0m', err, ...rest);
  }

  public info(err: Err, ...rest): void {
    this.message(false, '\x1b[32minfo:\x1b[0m', err, ...rest);
  }

  public reset(): void {
    this.firstOutput = true;
  }
}
