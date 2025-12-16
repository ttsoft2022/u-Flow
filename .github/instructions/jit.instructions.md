# **Các Quy Tắc VÀNG JIT (Just-In-Time)**

(Phiên bản đã được JIT: Cấu trúc lại theo logic: 1\. Triết lý (Why) \-\> 2\. Cách làm (How) \-\> 3\. Ràng buộc (Constraints) \-\> 4\. Ví dụ (Examples))

## **PHẦN 1: TRIẾT LÝ JIT TỔNG QUÁT (THE GENERAL JIT PHILOSOPHY)**

### **Triết lý Cốt lõi: Xác định "Giá trị"**

Mục tiêu luôn là làm **người dùng hài lòng**, được định nghĩa bởi 3 trụ cột:

1. **Chính xác:** Sản phẩm hiển thị đúng thông tin, giải quyết đúng vấn đề.  
2. **Nhanh & Không lỗi:** Sản phẩm phản hồi tức thì, không treo, không "lỗi vặt".  
3. **Đẹp & Hiện đại:** Sản phẩm chuyên nghiệp, tạo cảm giác tin tưởng.

### **Bộ lọc JIT cho Tính năng (The JIT Feature Filter)**

Mọi thứ được thêm vào hệ thống (một cái nút, một màn hình, một dòng code, một animation) đều PHẢI trả lời 4 câu hỏi này. Nếu không, nó là **Lãng phí (Muda)** và PHẢI bị loại bỏ.

1. **Cái này dùng để làm gì?** (Nó có giải quyết một vấn đề THỰC SỰ của người dùng không?)  
2. **User cảm nhận thế nào?** (Nó có làm họ bối rối, chậm lại, hay khó chịu không?)  
3. **Có cần không?** (Điều gì xảy ra nếu chúng ta KHÔNG làm tính năng này?)  
4. **Có bỏ được không?** (Chúng ta có thể đạt được mục tiêu tương tự bằng cách đơn giản hóa một tính năng hiện có không?)

### **Bài học 1: RÕ RÀNG là trên hết (Clarity \> Beauty)**

* ❌ **SAI:** Dùng một icon hiện đại, đẹp nhưng khó hiểu. Thêm animation phức tạp làm người dùng mất tập trung. Che giấu thông tin quan trọng để giao diện "sạch".  
* ✅ **ĐÚNG:** **"Không Làm Thừa" (Don't do if unnecessary)**. Giao diện (hoặc code) có rõ ràng không? Người dùng (hoặc lập trình viên khác) có biết chính xác phải làm gì tiếp theo không?  
* **Quy tắc:** Ưu tiên sự rõ ràng tuyệt đối. Loại bỏ mọi yếu tố (animation, hình ảnh, pop-up, các lớp trừu tượng code không cần thiết) không phục vụ trực tiếp cho mục tiêu.

### **Bài học 2: TÁI SỬ DỤNG, KHÔNG TÁI PHÁT MINH (Reuse, Don't Reinvent)**

* ❌ **SAI:** Thiết kế một component Card mới cho màn hình "Sales" và một Card khác một chút cho màn hình "Production". Viết một hàm search mới trong khi đã có một hàm tương tự.  
* ✅ **ĐÚNG:** **"Tái Sử Dụng" (Reuse Existing)**. Sử dụng một Design System hoặc một bộ component/hàm chuẩn. "Không Tái Phát Minh" cái nút, cái thẻ (card), hay logic.  
* **Quy tắc:** Sử dụng component/hàm có sẵn. Nếu buộc phải tạo mới, hãy tạo nó đủ "ngu" (dumb) / chung chung (generic) để có thể tái sử dụng ở 5 nơi khác.

### **Bài học 3: THIẾT KẾ VỪA ĐỦ (Design Just Enough)**

* ❌ **SAI:** Dành 1 tuần làm mockup Figma / thiết kế kiến trúc hệ thống hoàn hảo cho 20 tính năng, trong khi đội code mới chỉ bắt đầu Giai đoạn 2 (Lập kế hoạch).  
* ✅ **ĐÚNG:** **"Hệ thống Kéo" (Pull System)**. Chỉ thiết kế chi tiết (high-fidelity) cho 1-2 tính năng *sắp được code*. Sử dụng bản phác thảo (low-fidelity) hoặc wireframe cho các tính năng tương lai.  
* **Quy tắc:** Không để thiết kế chạy trước code quá xa. Thiết kế chỉ "vừa đủ, đúng lúc" (Just-In-Time) cho sprint/tác vụ tiếp theo.

## **PHẦN 2: 3 NGUYÊN TẮC THỰC THI JIT (THE 3 JIT EXECUTION PRINCIPLES)**

Đây là cách áp dụng triết lý JIT vào các quy trình hàng ngày (Thiết kế, Code, Debug, Nâng cấp). Đây là các biện pháp cơ bản nhất.

### **1\. "LÀM ĐÂU GỌN ĐÓ" (CLEAN AS YOU GO)**

* Mỗi hàm, mỗi commit phải hoàn chỉnh và tự kiểm thử được.  
* Không tạo ra tác dụng phụ (side effects), không thay đổi (mutate) global state.  
* Hoàn thành là hoàn thành. Xóa các file log/debug tạm thời ngay lập tức.  
* Không đợi "phiên bản hoàn hảo", nâng cấp từng phần nhỏ và kiểm thử ngay.

### **2\. "SỬA TẬN GỐC" (FIX AT ROOT)**

* Luôn suy nghĩ kỹ về nguyên nhân gốc rễ trước khi viết code.  
  * Ví dụ: "Treo do dữ liệu đầy đủ" → Thử truy vấn chọn lọc (selective query) **TRƯỚC KHI** thêm timeout.  
* Validate (kiểm tra) input càng sớm càng tốt (Fail fast).  
* Không "vá" triệu chứng. (Ví dụ: API chậm → Tối ưu backend/CDN, **KHÔNG** viết logic retry phức tạp ở frontend).

### **3\. "KHÔNG LÀM THỪA" (DON'T DO IF UNNECESSARY)**

* Ưu tiên giải pháp đơn giản và native (ví dụ: fetch() thay vì axios nếu chỉ cần 1 lệnh GET).  
* Chỉ thêm thư viện nếu native không đủ.  
* Đừng thiết kế các lớp (layers) thừa. (Ví dụ: Dùng cache của trình duyệt nếu đủ, không cần tự xây dựng).  
* Đừng tối ưu hóa khi chưa có số liệu (metrics). (Ví dụ: Chỉ thêm cache khi đã đo lường (profile) và thấy rõ bottleneck).

## **PHẦN 3: 4 NGUYÊN TẮC CỐT LÕI (THE 4 CORE PRINCIPLES)**

Đây là các quy tắc KHÔNG THỂ VI PHẠM (ràng buộc cấm) trong quá trình thực thi kỹ thuật.

### **1\. KHÔNG DÙNG GIẢI PHÁP DỰ PHÒNG (NEVER USE FALLBACK)**

**Lỗi là để sửa, không phải để che giấu.**

Khi code thất bại, **CẤM:**

* Thêm try-catch với giá trị mặc định.  
* Sử dụng || defaultValue để che giấu undefined/null.  
* Trả về mảng/object rỗng khi thao tác thất bại.  
* Chuyển sang logic dự phòng mà không sửa gốc.

Thay vào đó, **PHẢI:**

1. **Tìm ra lý do thất bại** (Input không hợp lệ? API sập? Config sai?).  
2. **Sửa tận gốc (Fix at source)** (Validate input sớm, sửa config, xử lý lỗi rõ ràng).  
3. **Báo lỗi ngay lập tức (Fail fast)** (Throw Error rõ ràng, không che giấu).  
4. **Thông báo cho người dùng** (Cho thấy điều gì đã sai, không âm thầm dùng giá trị mặc định).

**VÍ DỤ:**

// ❌ SAI (Che giấu lỗi)  
async function getUser(id) {  
  try {  
    return await fetch(\`/api/user/${id}\`);  
  } catch {  
    return { name: 'Unknown' }; // ❌ Hides why fetch failed  
  }  
}

// ✅ ĐÚNG (Fail fast, Sửa gốc)  
async function getUser(id) {  
  if (\!id) throw new Error('User ID required'); // Validate sớm  
  const res \= await fetch(\`/api/user/${id}\`);  
  if (\!res.ok) throw new Error(\`User ${id} not found: ${res.status}\`); // Lỗi rõ ràng  
  return res.json();  
}

### **2\. KHÔNG LÀM TẠM BỢ (NEVER DO TEMPORARY FIXES)**

**"Làm đâu gọn đó" \= Làm đúng ngay lần đầu tiên.**

Khi gặp sự không khớp (config, tên biến, định dạng dữ liệu), **CẤM:**

* Thêm lớp mapping/alias (ví dụ: extract\_content → extract\_web\_content).  
* Tạo các hàm chuyển đổi tạm thời.  
* Thêm comment // TODO: fix later.

Thay vào đó, **PHẢI:**

1. **Sửa tận gốc (Fix at source)** (Cập nhật config/dữ liệu tại nơi nó bắt đầu).  
2. **Cập nhật tất cả tham chiếu** (Thay đổi TẤT CẢ nơi dùng tên cũ sang tên mới trong MỘT commit).  
3. **Làm đâu gọn đó (Clean as you go)** (Xóa code tạm thời ngay sau khi sửa gốc).  
4. **Không có trạng thái trung gian** (Code phải chạy đúng ở mọi commit, không phải "sẽ sửa ở PR sau").

**VÍ DỤ:**

// ❌ SAI (Tạo mapping tạm thời)  
const data \= apiResponse.map(item \=\> ({  
  userName: item.user\_name, // Mapping tạm bợ  
  // ...  
}));

// ✅ ĐÚNG (Sửa tại gốc)  
// Yêu cầu API endpoint (hoặc Mock Server) trả về \`userName\` ngay từ đầu.  
// Code frontend chỉ việc sử dụng \`item.userName\`.

### **3\. LUÔN HỎI LẠI USER (ALWAYS CONFIRM WITH USER)**

**"Không được tự ý làm, phải hỏi lại user" \= Không bao giờ tự ý hành động.**

Trước khi thực hiện bất kỳ hành động quan trọng nào (coding, debug, nâng cấp, sửa file), bạn **PHẢI:**

1. **Trình bày kế hoạch:** Nêu rõ bạn sẽ làm gì và tại sao.  
2. **Chờ phê duyệt:** Không tiếp tục cho đến khi người dùng xác nhận.  
3. Giải thích tác động: Mô tả ngắn gọn kết quả hoặc thay đổi mong đợi.  
   (Đây là một Hệ thống Kéo (Pull System)).

### **4\. (CẬP NHẬT) LẬP KẾ HOẠCH ĐỘNG & QUẢN LÝ CONTEXT (DYNAMIC PLANNING & CONTEXT)**

(A) Lập kế hoạch động (Dynamic Planning):  
Khi user yêu cầu một thay đổi lớn hoặc nâng cấp chức năng (ví dụ: "thêm tính năng X"), đó là một tín hiệu "Kéo" (Pull).

* **PHẢI:**  
  1. **Tạo một file kế hoạch mới** (ví dụ: plans/YYYY-MM-DD\_Feature\_X.md).  
  2. **Phân rã (Breakdown):** Phân rã yêu cầu thành các bước cơ bản có thể kiểm tra (trackable) với checkbox (⬜).  
  3. **Trình bày:** Trình bày file kế hoạch này cho user duyệt (theo Nguyên tắc 3).  
* **Quy tắc:** File kế hoạch này chính là **"bộ nhớ" (memory)** cho tác vụ đó.

(B) Quản lý Context (Context Management):  
Context window có hạn. Tránh "tràn" hoặc "quên" nhiệm vụ.

* **(Write):** Sau khi **HOÀN THÀNH MỘT TÁC VỤ CƠ BẢN** (ví dụ: porting xong 1 component, chạy xong 1 kịch bản UAT, cài đặt xong 1 thư viện \- tức là đánh dấu ⬜ thành ✅), bạn PHẢI cập nhật trạng thái vào file kế hoạch tương ứng.  
* **(Read):** Trước MỖI bước tiếp theo, bạn PHẢI đọc lại file kế hoạch đó để biết chính xác: (1) Đã làm gì, (2) Vừa làm gì, (3) Bước tiếp theo là gì.  
* **Quy tắc:** Các file kế hoạch (plans/\*.md) là **"bộ nhớ ngoài" (external memory)** và là **Nguồn Chân lý Duy nhất (Single Source of Truth)**, quan trọng hơn lịch sử chat.

## **PHẦN 4: 5 BÀI HỌC CODE THỰC TIỄN (5 CRITICAL CODING LESSONS)**

Đây là các bài học (áp dụng các nguyên tắc trên) được đúc kết từ các dự án thực tế.

### **Bài học 1 (Code): Make It RIGHT First Time \- Not "Make It Work Then Fix"**

* ❌ **SAI:** "Làm cho nó chạy đã, tối ưu sau" → Code nhanh bị lỗi → Mất hàng giờ debug → Phải viết lại → Tổng thời gian: 3x.  
* ✅ **ĐÚNG:** "Để tôi hiểu yêu cầu \+ ràng buộc trước" → Kiểm tra Schema/API (5 phút) → Viết code đúng (20 phút) → Chạy đúng ngay lần đầu → Tổng thời gian: 30 phút.  
* **Quy tắc:** "Đo hai lần, cắt một lần". Luôn kiểm tra API contract, schema DB, hoặc file .env **TRƯỚC KHI** viết code. (Áp dụng "SỬA TẬN GỐC").

### **Bài học 2 (Code): Start Simple, NOT Complex Then Simplify**

* ❌ **SAI:** Thiết kế một giải pháp phức tạp, toàn diện ngay từ đầu (ví dụ: một query 40 dòng với 3 join).  
* ✅ **ĐÚNG:** Làm cho tính năng nhỏ nhất hoạt động (ví dụ: một query 7 dòng với 2 bảng). Sau đó mới thêm các tính năng phức tạp (lọc, sắp xếp) dựa trên nền tảng đơn giản đã chạy đúng.  
* **Quy tắc:** Lấy phản hồi nhanh (fast feedback). Tối ưu hóa khi chậm (đo lường trước, không đoán). (Áp dụng "KHÔNG LÀM THỪA").

### **Bài học 3 (Code): Reuse Existing, Don't Reinvent**

* ❌ **SAI:** Tạo một file/component/logic mới cho một thứ tương tự đã có (ví dụ: tạo hybrid\_search.py trong khi đã có search.py).  
* ✅ **ĐÚNG:** Tìm một component/logic có sẵn trong code và mở rộng nó (ví dụ: thêm hybrid\_search vào file search.py có sẵn).  
* **Quy tắc:** Chỉ tạo mới khi làm về một lĩnh vực (domain) hoàn toàn khác (ví dụ: auth, billing). (Áp dụng Bài học 2: "TÁI SỬ DỤNG").

### **Bài học 4 (Code): Never Conclude Without Verification**

* ❌ **SAI:** "Kiểm tra SN1-13 tồn tại → thấy SN56 bị thiếu → kết luận 'dữ liệu không đầy đủ'".  
* ✅ **ĐÚNG:** Xác minh từ nhiều góc độ trước khi kết luận:  
  1. Kiểm tra bằng mẫu tham chiếu (SN56.11).  
  2. Kiểm tra bằng tìm kiếm văn bản (dhammacakkappavattana).  
  3. Phát hiện ra dữ liệu tồn tại nhưng với tham chiếu KHÁC (SN12.11).  
  4. **Nguyên nhân gốc:** Hệ thống đánh số khác nhau, **không phải** thiếu dữ liệu. (Áp dụng "SỬA TẬN GỐC").

### **Bài học 5 (Code): Verify ENTIRE Data Flow \- Backend → Frontend**

* ❌ **SAI:** "Backend log thấy đã gửi pali\_title. Frontend không hiển thị" → Kết luận: "Lỗi cache, cần hard refresh" → Mất thời gian vô ích.  
* ✅ **ĐÚNG:** Xác minh TỪNG bước của dòng chảy dữ liệu:  
  1. **Backend Query:** SELECT có pali\_title không?  
  2. **Backend Response (API Test):** JSON trả về có pali\_title không?  
  3. **Network Tab (Flipper/DevTools):** Ứng dụng có *nhận* được JSON đó không?  
  4. **Code (axios/fetch/mapping):** Logic map dữ liệu có làm *mất* trường pali\_title không?  
  5. **State Management:** Dữ liệu có vào state đúng không?  
  6. **Component:** Code render có sử dụng trường đó không?  
* **Lỗi phổ biến nhất:** Backend gửi đủ, nhưng code **mapping** ở frontend làm mất trường dữ liệu. "Hard refresh" không bao giờ sửa được lỗi code. (Áp dụng "SỬA TẬN GỐC").