# jtbanka2mbox

Convertor of J&amp;T Banka XML statements into sMoneybox import CSV files.

Small command line utility to convert J&amp;T Banka savings account transaction
history (saved from the online banking, in a number of XML files) to a CSV file
compatible with sMoneybox import. The tool uses a small JSON configuration file
to map (transaction) end-to-end codes to (sMoneybox) categories.

## Usage

```
$ ./bin/jtbanka2mbox --in <XML_FILENAMES_PREFIX> --out <CSV_FILENAME> [--config <MAPPING_FILENAME>]
```

The tool is written in TypeScript for recent version of
[node.js](www.nodejs.org), the `node` binary must be in system PATH. To install
the dependencies and compile it, run
```
$ yarn && yarn build
```

If the `config` command line option is not provided, `mapping.json` default
filename is used.

## Configuration

To map (bank account transaction) end-to-end codes to (sMoneybox) categories,
create a simple JSON file with the mapping and pass the filename in `config`
command line option (or store it as `mapping.json` file in current directory).

Besides the individual codes to map, there are some special keys in the mapping
object you can provide:
* `interest`: the category to which the savings account interests will be added,
* `empty`: the category to use in case no end-to-end code for the transaction
was provided, and
* `default`: the category to use in case no other more specific mapping was
found.

In case the tool cannot map a transaction to category, you'll get a warning and
the resulting sMoneybox category will be left empty.

JSON configuration file format / example:
```
{
    "123": "vacation",
    "456": "car",
    "789": "house",
    "interest": "house"
}
```

## XML files

J&amp;T Banka provides daily statements, so you'll likely have a number of
downloaded XML files for the period you want to import into sMoneybox.

For this reason the `in` command line option is not a single filename
(eventhough it could be!), but rather a (string) **prefix** of the XML filenames
to process.

It can for example be `2020` for all XML statements of year 2020, or `202006`
for statements from June 2020 only.

The files to process must have '.xml' or '.XML' extensions only!

## MIT License

Copyright (c) 2021 Roman Kaspar

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
