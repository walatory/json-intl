import { Form, Table, Button, Flex, Space, Upload, Radio, message, ConfigProvider } from 'antd';
import './App.css'
import { useState } from 'react';
import JSZip from "jszip";
import { saveAs } from "file-saver";
import zhCN from "antd/locale/zh_CN";

function App() {
  let files = [];
  const [curFiles, setCurFiles] = useState([]);
  const [mainName, setMainName] = useState("");
  const [names, setNames] = useState([]);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [orgins, setOrgins] = useState([]);
  const [api, holder] = message.useMessage();
  const [trLoading, setTrLoading] = useState(false);
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
      v.push({ 'name': file.name, 'data': a });
    }
    const data = [];
    const columns = [
      {
        title: '配置',
        dataIndex: 'config_aux',
        key: 'config_aux',
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
        data.push({ 'config_aux': b });
        temp[b] = b;
      }
    }
    for (let a of data) {
      for (let b of v) {
        a[b.name] = b.data[a.config_aux];
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
    if(!mainName) {
      api.info("请先选中依据的语言");
      return;
    }
    setTrLoading(true);
    let data2 = [...data];
    try {
      for (let a of data2) {
        for (let b of orgins) {
          if (!b.data[a.config_aux] && a[mainName]) {
            let tr = mainName.substring(0, 2) + "2" + b.name.substring(0, 2);
            let x = (await (await ft(tr, a[mainName])).json()).response.translated_text;
            b.data[a.config_aux] = x;
            a[b.name] = x;
            setData([...data2]);
          }
        }
      }
    }catch (e) {
      api.error('翻译失败', e);
    } finally {
      setTrLoading(false);
    }
  }
  let download = async () => {
    if (data.length === 0) {
      api.info("没有数据可以下载");
      return;
    }
    let zip = new JSZip();
    for (let o of orgins) {
      zip.file(o.name, JSON.stringify(o.data, null, 2));
    }
    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, new Date().getTime() + ".zip");
    });
  };

  return (
    <>
    <ConfigProvider locale={zhCN}>
    {holder}
      <Flex vertical gap={"small"} style={{height: 'calc(100vh - 2rem)'}}>
        <Flex gap={"large"}>
            <Button type='primary' onClick={click}>解析</Button>
          <Upload {...props} showUploadList={false}>
          <Space>
            <Button>选中json文件</Button>
            <label>{curFiles.length} 份文件</label>
            </Space>
          </Upload>
        </Flex>
        <Space>
            <Button loading={trLoading} type='primary' onClick={translate}>翻译空白处</Button>
        <Form
          layout="inline">
          <Form.Item label="选中依据语言">
            <Radio.Group value={mainName} onChange={e => setMainName(e.target.value)}>
              {names.map(a => (<Radio.Button value={a} key={a}>{a}</Radio.Button>))}
            </Radio.Group>
          </Form.Item>
        </Form>
        </Space>
            <Button type='primary' onClick={download}>导出</Button>
        <Table style={{overflow: 'auto'}} sticky={true} bordered pagination={{ pageSize: 1000 }} columns={columns} dataSource={data} >
        </Table>
      </Flex>
      </ConfigProvider>
    </>
  );

}

export default App
