import {writeFileSync} from 'fs';

import {Err, Logger} from './logger';
import {ParsedXmlFile, Parser, XmlEntry} from './parser';

type OutEntry = Omit<XmlEntry, 'endToEndCode'> & {category: string};

export class Client {
  private logger = new Logger();

  public run(cmdLineArgs: string[]): void {
    const parser = new Parser(this.logger);
    const args = parser.parseCmd(cmdLineArgs);
    const config = parser.parseConfigFile(args.configName);
    const xmlData = parser.parseXmlFiles(args.inPrefix);
    const outEntries = this.mapCodesToCategories(config, xmlData);
    this.writeOutput(args.outName, outEntries);
  }

  private mapCodesToCategories(config: Record<string, string>, xmlData: ParsedXmlFile[]): OutEntry[] {
    this.logger.reset();
    const entries: OutEntry[] = [];
    xmlData.forEach((batch) => {
      batch.entries.forEach((entry, index) => {
        let category: string = config[entry.endToEndCode];
        if (typeof category !== 'string') {
          category = config.default;
        }
        if (typeof category !== 'string') {
          this.logger.warning(Err.CANNOT_MAP_CODE, entry.endToEndCode, index + 1, batch.filename);
          category = '';
        }
        entries.push({
          amount: entry.amount,
          category,
          date: entry.date,
        });
      });
    });
    return entries;
  }

  private writeOutput(filename: string, entries: OutEntry[]): void {
    this.logger.reset();
    let content = '"Date","Category","Name","Description","Amount"\n';
    entries.forEach((entry) => {
      content += `"${entry.date}","${entry.category}","","","${entry.amount.toFixed(2)}"\n`;
    });
    try {
      writeFileSync(filename, content);
    } catch(e) {
      this.logger.error(Err.CANNOT_WRITE_FILE, filename);
    }
    this.logger.info(Err.OUT_FILE_WRITTEN, filename, entries.length, (entries.length === 1 ? 'entry' : 'entries'));
  }
}
