# EditorJS Wrap Bug - Root Cause and Fix

## Bối cảnh lỗi

Ở màn hình sửa blog, dữ liệu `content` từ BE đã trả về đúng nhưng vùng EditorJS có hiện tượng:

- nội dung hiện lên trong chớp mắt rồi biến mất;
- không gõ/chỉnh sửa tiếp được;
- đổi ngôn ngữ hoặc remount editor thì lỗi lặp lại.

## Vì sao lỗi xảy ra

`BlockEditor` trước đây khởi tạo EditorJS trực tiếp trên cùng một DOM holder (`holderRef.current`) và cleanup theo kiểu bất đồng bộ:

1. Mount 1 tạo instance `E1` trên holder `H`.
2. Cleanup 1 chạy, đợi `E1.isReady` rồi mới `destroy()` và `H.replaceChildren()`.
3. Trong lúc đó, React mount lại (StrictMode dev hoặc đổi `editorKey`) tạo instance `E2` cũng trên `H`.
4. Khi cleanup cũ hoàn tất, lệnh `H.replaceChildren()` của `E1` xóa luôn DOM mà `E2` đang dùng.

Kết quả: editor mới bị "quét trắng", gây cảm giác nhấp nháy và mất nội dung.

## Vì sao fix mới hoạt động

Fix đã đổi chiến lược từ "1 holder dùng chung" sang "mỗi instance có inner holder riêng":

- `holderRef.current` chỉ là wrapper ổn định (`wrap`);
- mỗi lần mount tạo một `div` con mới (`inner holder`) và truyền `holder: inner`;
- cleanup chỉ `destroy()` và remove đúng `inner` của instance đó (có guard `if (el.parentNode === wrap)`).

Như vậy cleanup của instance cũ không còn động vào DOM của instance mới.

## Tóm tắt kỹ thuật

- Trước fix: cleanup của instance cũ có thể thao tác trên cùng node DOM với instance mới -> race condition.
- Sau fix: mỗi instance có node DOM riêng -> cleanup cũ bị cô lập phạm vi ảnh hưởng.
- Hiệu quả: hết hiện tượng "data chớp rồi mất", editor ổn định trong cả StrictMode và lúc remount theo `editorKey`.

## Ghi chú thêm

- Vấn đề này không phải do shape dữ liệu BE.
- Đây là lỗi lifecycle + async cleanup khi tích hợp thư viện imperative (EditorJS) trong React.
- Pattern "stable wrapper + per-instance inner node" là cách an toàn cho các editor tương tự (EditorJS, Quill, Monaco, v.v.).

