import {readdirSync, readFileSync} from 'fs';
import minimist from 'minimist';
import * as xmlParser from 'fast-xml-parser';

import {Err, Logger} from './logger';

type ParsedArgs = {
  configName: string;
  inPrefix: string;
  outName: string;
}

export type XmlEntry = {
  amount: number;
  date: string;
  endToEndCode: string;
}

export type ParsedXmlFile = {
  entries: XmlEntry[];
  filename: string;
}

export class Parser {
  constructor (private logger: Logger) {
  }

  public parseCmd(cmdLineArgs: string[]): ParsedArgs {
    const parsed = minimist(cmdLineArgs, {string: ['config', 'in', 'out']});
    if (!parsed.in) {
      this.logger.error(Err.CMD_ARG_MISSING, 'in');
    }
    if (!parsed.out) {
      this.logger.error(Err.CMD_ARG_MISSING, 'out');
    }
    const configName = (parsed.config || 'mapping.json');
    return {
      configName,
      inPrefix: parsed.in,
      outName: parsed.out,
    };
  }

  public parseConfigFile(filename: string): Record<string, string> {
    let content: string;
    try {
      content = readFileSync(filename).toString();
    } catch(e) {
      this.logger.error(Err.CANNOT_READ_CFG_FILE, filename);
    }
    let config: Record<string, string>;
    try {
      config = JSON.parse(content);
    } catch(e) {
      this.logger.error(Err.CANNOT_PARSE_CFG_FILE, filename);
    }
    if (typeof config !== 'object') {
      this.logger.error(Err.INVALID_CFG_FILE_FORMAT, filename);
    }
    Object.entries(config).forEach(([key, value]) => {
      if (typeof value !== 'string') {
        this.logger.error(Err.INVALID_CFG_FILE_ENTRY, key, filename);
      }
    });
    this.logger.info(Err.CFG_FILE_LOADED, filename);
    return config;
  }

  public parseXmlFiles(prefix: string): ParsedXmlFile[] {
    const dirEntries = readdirSync('.', {withFileTypes: true});
    const filenames: string[] = [];
    dirEntries.forEach((entry) => {
      if (entry.isFile()) {
        filenames.push(entry.name.toString());
      }
    });
    const filtered = filenames.filter((name) => (name.startsWith(prefix) && (name.endsWith('.xml') || (name.endsWith('.XML')))));
    if (!filtered.length) {
      this.logger.error(Err.NO_XML_FILES_FOUND, prefix);
    }
    return filtered.map((name) => (this.parseOneXmlFile(name)));
  }

  private parseOneXmlFile(filename: string): ParsedXmlFile {
    let content: string;
    try {
      content = readFileSync(filename).toString();
    } catch(e) {
      this.logger.error(Err.CANNOT_READ_XML_FILE, filename);
    }
    let parsed;
    try {
      parsed = xmlParser.parse(content, undefined, true);
    } catch(e) {
      this.logger.error(Err.CANNOT_PARSE_XML_FILE, filename);
    }
    const entries = parsed.Document?.BkToCstmrStmt?.Stmt?.Ntry;
    if (!entries) {
      this.logger.error(Err.INVALID_XML_FILE_FORMAT, filename);
    }
    return this.processEntries(filename, Array.isArray(entries) ? entries : [entries]);
  }

  private processEntries(filename: string, xmlEntries: Record<string, any>[]): ParsedXmlFile {
    const entries: XmlEntry[] = [];
    xmlEntries.forEach((entry, index) => {
      // amount
      const amountAbs = entry.Amt;
      const amountSign = entry.CdtDbtInd;
      if (!amountAbs || !amountSign || (typeof amountAbs !== 'number') || (typeof amountSign !== 'string')) {
        this.logger.error(Err.CANNOT_PROCESS_XML_ENTRY, 'amount', index + 1, filename);
      }
      const amount = (amountSign === 'DBIT' ? -1 : +1) * amountAbs;
      // date
      const date = entry.ValDt?.Dt;
      if (!date || (typeof date !== 'string')) {
        this.logger.error(Err.CANNOT_PROCESS_XML_ENTRY, 'date', index + 1, filename);
      }
      // end-to-end code
      const info = entry.NtryDtls?.TxDtls;
      if (!info || (typeof info !== 'object')) {
        this.logger.error(Err.CANNOT_PROCESS_XML_ENTRY, 'end-to-end code', index + 1, filename);
      }
      let endToEndCode: string = 'empty';
      if ((info.AddtlTxInf === 'Vypořádání úroku vkladu') || (info.AddtlTxInf === 'Daň z úroků')) {
        endToEndCode = 'interest';
      } else {
        const ref = info.Refs?.EndToEndId;
        if (ref && (typeof ref === 'string') && (ref.startsWith('VS'))) {
          endToEndCode = ref.substr(2);
        }
      }
      entries.push({amount, date, endToEndCode});
    });
    this.logger.info(Err.XML_FILE_LOADED, filename);
    return {entries, filename};
  }
}
