// components/RichTextEditor.tsx
import React, { useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import Quill from "quill";
import ImageUploader from "quill-image-uploader";
import axios from "axios";

// 注册模块
Quill.register("modules/imageUploader", ImageUploader);

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
}

const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const quillRef = useRef<ReactQuill>(null);

  // 自定义图片上传处理
  const imageHandler = async () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // 使用你的上传逻辑（示例使用伪代码）
      const formData = new FormData();
      formData.append("image", file);

      try {
        // 替换为你的上传接口
        const response = await axios.post("/api/upload", formData);
        const imageUrl = response.data.url;

        const quill = quillRef.current?.getEditor();
        const range = quill?.getSelection();
        if (range) {
          quill?.insertEmbed(range.index, "image", imageUrl);
        }
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    };
  };

  // 配置模块和工具栏
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ["bold", "italic", "underline"],
          ["image"], // 显示图片上传按钮
        ],
        handlers: {
          image: imageHandler,
        },
      },
      imageUploader: {
        upload: (file: File) => {
          return new Promise((resolve, reject) => {
            // 这里可以直接复用上面的上传逻辑
            const formData = new FormData();
            formData.append("image", file);

            axios
              .post("/api/upload", formData)
              .then((res) => resolve(res.data.url))
              .catch((err) => reject("Upload failed"));
          });
        },
      },
    }),
    []
  );

  return (
    <ReactQuill
      ref={quillRef}
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
    />
  );
};

export default RichTextEditor;
