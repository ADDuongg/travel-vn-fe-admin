import { Form, Input, Space, Upload } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd/es/upload/interface';
import type React from 'react';

type Props = {
  thumbnailFileList: UploadFile[];
  setThumbnailFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
  galleryFileList: UploadFile[];
  setGalleryFileList: React.Dispatch<React.SetStateAction<UploadFile[]>>;
};

export default function ProvinceMediaEditor({
  thumbnailFileList,
  setThumbnailFileList,
  galleryFileList,
  setGalleryFileList,
}: Props) {
  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <Form.Item name={['thumbnail', 'alt']} label="Province thumbnail alt">
        <Input placeholder="Mô tả ảnh đại diện tỉnh/thành" />
      </Form.Item>
      <Form.Item label="Province thumbnail">
        <Upload
          accept="image/*"
          listType="picture-card"
          maxCount={1}
          beforeUpload={() => false}
          fileList={thumbnailFileList}
          onChange={({ fileList }) => setThumbnailFileList(fileList.slice(-1))}
        >
          {thumbnailFileList.length < 1 && (
            <div>
              <PlusOutlined />
              <div style={{ marginTop: 8 }}>Upload</div>
            </div>
          )}
        </Upload>
      </Form.Item>
      <Form.Item label="Gallery (Cloudinary)">
        <Upload
          accept="image/*"
          listType="picture-card"
          multiple
          beforeUpload={() => false}
          fileList={galleryFileList}
          onChange={({ fileList }) => setGalleryFileList(fileList)}
        >
          <div>
            <UploadOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
          </div>
        </Upload>
      </Form.Item>
    </Space>
  );
}
