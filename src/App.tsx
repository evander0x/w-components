import { useState } from "react";
import { Button, Layout, Typography, Space, Card, theme, Divider } from "antd";
import Counter from "./components/Counter";
import "./App.css";
import RichTextEditor from "./components/ Teatarea";

const { Header, Content, Footer } = Layout;

function App() {
  const [content, setContent] = useState("");

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      <Content
        style={{
          padding: "50px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div className="container">
          <RichTextEditor value={content} onChange={setContent} />

          {/* 显示HTML内容 */}
          <div
            className="preview"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      </Content>
    </Layout>
  );
}

export default App;
