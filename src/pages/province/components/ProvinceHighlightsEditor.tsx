import { Button, Card, Divider, Form, Input, InputNumber, Space, Tabs, Typography, Upload } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { FormInstance } from 'antd/es/form';
import type { UploadFile } from 'antd/es/upload/interface';
import type React from 'react';

const { Text } = Typography;

export type ActiveLanguageTab = { code: string; label: string };

type Props = {
  form: FormInstance;
  activeLanguages: ActiveLanguageTab[];
  highlightUploadMap: Record<number, UploadFile[]>;
  setHighlightUploadMap: React.Dispatch<
    React.SetStateAction<Record<number, UploadFile[]>>
  >;
  mapUrlToUploadFile: (url: string, key: string) => UploadFile;
};

export default function ProvinceHighlightsEditor({
  form,
  activeLanguages,
  highlightUploadMap,
  setHighlightUploadMap,
  mapUrlToUploadFile,
}: Props) {
  return (
    <Form.List name="highlights">
      {(fields, { add, remove }) => (
        <Space direction="vertical" style={{ width: '100%' }} size={12}>
            {fields.map((field) => (
              <Card key={field.key} size="small">
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  <Tabs
                    items={activeLanguages.map((lang) => ({
                      key: lang.code,
                      label: lang.label,
                      children: (
                        <>
                          <Form.Item
                            name={[
                              field.name,
                              'translations',
                              lang.code,
                              'name',
                            ]}
                            label="Tên highlight"
                          >
                            <Input
                              placeholder={
                                lang.code === 'vi'
                                  ? 'Tên điểm nổi bật'
                                  : 'Highlight name'
                              }
                            />
                          </Form.Item>
                          <Form.Item
                            name={[
                              field.name,
                              'translations',
                              lang.code,
                              'description',
                            ]}
                            label="Mô tả"
                          >
                            <Input.TextArea rows={2} />
                          </Form.Item>
                        </>
                      ),
                    }))}
                  />
                  <Divider style={{ margin: 0 }} />
                  <Form.Item label="Thumbnail" style={{ marginBottom: 0 }}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Upload
                        accept="image/*"
                        listType="picture-card"
                        maxCount={1}
                        beforeUpload={() => false}
                        fileList={
                          highlightUploadMap[field.name] ||
                          (() => {
                            const currentUrl = form.getFieldValue([
                              'highlights',
                              field.name,
                              'thumbnail',
                              'url',
                            ]);
                            return currentUrl
                              ? [
                                  mapUrlToUploadFile(
                                    currentUrl,
                                    `highlight-${field.key}`,
                                  ),
                                ]
                              : [];
                          })()
                        }
                        onChange={({ fileList }) =>
                          setHighlightUploadMap((prev) => ({
                            ...prev,
                            [field.name]: fileList.slice(-1),
                          }))
                        }
                      >
                        {(highlightUploadMap[field.name] || []).length < 1 && (
                          <div>
                            <PlusOutlined />
                            <div style={{ marginTop: 8 }}>Upload</div>
                          </div>
                        )}
                      </Upload>
                      {form.getFieldValue([
                        'highlights',
                        field.name,
                        'thumbnail',
                        'url',
                      ]) && (
                        <Text type="secondary">
                          Ảnh hiện tại đang được giữ nếu không chọn ảnh mới.
                        </Text>
                      )}
                      <Space style={{ width: '100%' }} wrap>
                        <Form.Item
                          name={[field.name, 'thumbnail', 'alt']}
                          label="Thumbnail alt"
                          style={{ minWidth: 280, flex: 1 }}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'thumbnail', 'order']}
                          label="Thumbnail order"
                          style={{ minWidth: 180 }}
                        >
                          <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                      </Space>
                    </Space>
                  </Form.Item>
                  <Button
                    danger
                    onClick={() => {
                      remove(field.name);
                      setHighlightUploadMap((prev) => {
                        const next: Record<number, UploadFile[]> = {};
                        Object.entries(prev).forEach(([k, v]) => {
                          const idx = Number(k);
                          if (Number.isNaN(idx)) return;
                          if (idx < field.name) next[idx] = v;
                          if (idx > field.name) next[idx - 1] = v;
                        });
                        return next;
                      });
                    }}
                  >
                    Xoá highlight
                  </Button>
                </Space>
              </Card>
            ))}
            <Button type="dashed" onClick={() => add()} block>
              Thêm highlight
            </Button>
        </Space>
      )}
    </Form.List>
  );
}
