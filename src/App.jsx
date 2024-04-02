import { Form, Table, Button, Flex, Space, Upload, Radio, message, Typography, Select } from 'antd';
import './App.css'
import { useState } from 'react';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { FormattedMessage, useIntl } from 'react-intl';
import { useLanguage, langList } from './LanguageProvider';
import { GlobalOutlined } from "@ant-design/icons";
const itemIndexName = 'you_cannot_name_like_my_name';

function App() {
  let files = [];
  const [curFiles, setCurFiles] = useState([]);
  const [newLang, setNewLang] = useState("");
  const [mainName, setMainName] = useState("");
  const [names, setNames] = useState([]);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [orgins, setOrgins] = useState([]);
  const [api, holder] = message.useMessage();
  const [trLoading, setTrLoading] = useState(false);
  const [exLoading, setExLoading] = useState(false);
  const intl = useIntl();
  const [lang, setLang] = useLanguage();
  const props = {
    name: 'file',
    multiple: true,
    beforeUpload: (file) => {
      files.push(file);
      setCurFiles([...files]);
      return false;
    },
  };
  let click = async () => {
    if (curFiles.length === 0) {
      api.info(intl.formatMessage({ id: 'notice.selectFiles' }));
      return;
    }
    let v = [];
    for (let file of curFiles) {
      let a = await new Promise((r) => {
        const reader = new FileReader();
        reader.onload = () => {
          let a = JSON.parse(reader.result);
          r(a);
        };
        reader.readAsText(file);
      });
      console.log("read " + file.name, a);
      v.push({ name: file.name, data: a });
    }
    const data = [];
    const columns = [
      {
        title: (<FormattedMessage id="table.column1"></FormattedMessage>),
        dataIndex: itemIndexName,
        key: itemIndexName,
        fixed: 'left',
      },
    ];
    let temp = {};
    for (let a of v) {
      columns.push({
        title: a.name,
        dataIndex: a.name,
        key: a.name,
      });
      for (let b in a.data) {
        if (b in temp) {
          continue;
        }
        let it = {};
        it[itemIndexName] = b;
        data.push(it);
        temp[b] = b;
      }
    }
    for (let a of data) {
      for (let b of v) {
        a[b.name] = b.data[a[itemIndexName]];
      }
    }
    setColumns(columns);
    setData(data);
    setOrgins(v);
    setNames(v.map(a => a.name));
  };
  let ft = async (fromTo, txt) => {
    return fetch(`https://t.x7x7.workers.dev/${fromTo}/${encodeURIComponent(txt)}`);
  }
  let translate = async () => {
    if (!mainName) {
      api.info(intl.formatMessage({ id: 'notice.selectMainLang' }));
      return;
    }
    setTrLoading(true);
    let data2 = [...data];
    let count = 0;
    try {
      for (let a of data2) {
        for (let b of orgins) {
          let txt = a[mainName];
          if (!b.data[a[itemIndexName]] && txt) {
            let tr = mainName.substring(0, 2) + "2" + b.name.substring(0, 2);
            let vars = txt.match(/\{.+?\}/g) || [];
            let x = (await (await ft(tr, txt)).json()).response.translated_text;
            let xtrim = x.replace(/\s+/g, '');
            for (let vx of vars) {
              if (xtrim.indexOf(vx.replace(/\s+/g, '')) < 0) {
                x += " " + vx;
              }
            }
            b.data[a[itemIndexName]] = x;
            a[b.name] = x;
            setData([...data2]);
            count += 1;
          }
        }
      }
    } catch (e) {
      api.error(intl.formatMessage({ id: 'notice.fail' }, { count }));
      console.log("tr error", e);
      return;
    } finally {
      setTrLoading(false);
    }
    api.success(intl.formatMessage({ id: 'notice.success' }, { count }));
  }
  let download = async () => {
    if (data.length === 0) {
      api.info(intl.formatMessage({ id: 'notice.exportNoData' }));
      return;
    }
    let zip = new JSZip();
    for (let o of orgins) {
      zip.file(o.name, JSON.stringify(o.data, null, 2));
    }
    let content = await zip.generateAsync({ type: "blob" });
    saveAs(content, new Date().getTime() + ".zip");
  };
  let addLang = () => {
    let cs = [...columns];
    cs.push({
      title: newLang,
      dataIndex: newLang,
      key: newLang,
    });
    let os = [...orgins, { name: newLang, data: {} }];
    setColumns(cs);
    setData(data);
    setOrgins(os);
    setNames([...names, newLang]);
  };
  const filterOption = (input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase());

  return (
    <>
      {holder}
      <Flex vertical gap={"small"} style={{ height: 'calc(100vh - 2rem)' }}>
        <Flex gap={"large"} justify='space-between'>
          <Flex gap={"large"}>
            <Upload {...props} showUploadList={false}>
              <Space>
                <Button><FormattedMessage id="btn.selectFiles"></FormattedMessage></Button>
                <Typography.Text><FormattedMessage id="label.selectFiles" values={{ "count": curFiles.length }}></FormattedMessage></Typography.Text>
              </Space>
            </Upload>
            <Button type='primary' onClick={click}><FormattedMessage id="btn.parse"></FormattedMessage></Button>
            <Button loading={trLoading} type='primary' onClick={translate}><FormattedMessage id="btn.translate"></FormattedMessage></Button>
            <Button loading={exLoading} type='primary' onClick={e => { setExLoading(true); download(e).then(() => setExLoading(false)) }}><FormattedMessage id="btn.export"></FormattedMessage></Button>
          </Flex>

          <Space>
            <Select
            suffixIcon={<GlobalOutlined />}
              defaultValue={lang}
              onChange={e => setLang(e)}
              filterOption={filterOption}
              options={[
                { value: 'zh-CN', label: '中文' },
                { value: 'en-US', label: 'English' },
                { value: 'ja-JP', label: '日本語' },
                { value: 'es-ES', label: 'Español' },
                { value: 'fr-FR', label: 'Français' },
                { value: 'de-DE', label: 'Deutsch' },
                { value: 'it-IT', label: 'Italiano' },
                { value: 'pt-PT', label: 'Português' },
              ]}
            />
          </Space>
        </Flex>
        <Flex justify='space-between'>
          <Form
            layout="inline">
            <Form.Item label={intl.formatMessage({ id: 'label.selectMainLang' })}>
              <Radio.Group value={mainName} onChange={e => setMainName(e.target.value)}>
                {names.map(a => (<Radio.Button value={a} key={a}>{a}</Radio.Button>))}
              </Radio.Group>
            </Form.Item>
          </Form>
        </Flex>
        <Space style={{ width: '100%' }}>
          <Select
            showSearch
            allowClear
            onChange={e => setNewLang(e)}
            filterOption={filterOption}
            placeholder={intl.formatMessage({ id: 'select.addNewLang' })}
            options={
              langList.map(e => { return { value: e + ".json", label: e + ".json" } })}
          />
          <Button disabled={!newLang} type="primary" onClick={addLang}><FormattedMessage id='btn.addNewLang'></FormattedMessage></Button>
        </Space>
        <Table style={{ overflow: 'auto' }} sticky={true} bordered pagination={{ pageSize: 1000 }} columns={columns} dataSource={data} >
        </Table>
      </Flex>
    </>
  );

}

export default App
