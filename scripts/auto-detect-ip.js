/**
 * Script tự động phát hiện IP của máy tính và cập nhật vào config/api.js
 * 
 * Chạy script này trước khi start app:
 *   node scripts/auto-detect-ip.js
 * 
 * Hoặc thêm vào package.json script để tự động chạy
 */

const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  const ips = [];
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Bỏ qua internal (localhost) và non-IPv4
      // Ưu tiên các interface không phải loopback và không phải virtual adapter
      if (iface.family === 'IPv4' && !iface.internal) {
        // Bỏ qua các IP của virtual adapters (VMware, VirtualBox, etc.)
        const isVirtual = name.toLowerCase().includes('virtual') || 
                         name.toLowerCase().includes('vmware') ||
                         name.toLowerCase().includes('virtualbox') ||
                         name.toLowerCase().includes('hyper-v');
        
        if (!isVirtual) {
          ips.push({
            ip: iface.address,
            name: name,
            // Ưu tiên WiFi/Ethernet hơn các adapter khác
            priority: name.toLowerCase().includes('wi-fi') || 
                     name.toLowerCase().includes('wifi') ||
                     name.toLowerCase().includes('ethernet') ||
                     name.toLowerCase().includes('lan') ? 1 : 2
          });
        }
      }
    }
  }
  
  // Sắp xếp theo priority và trả về IP đầu tiên
  if (ips.length > 0) {
    ips.sort((a, b) => a.priority - b.priority);
    return ips[0].ip;
  }
  
  return null;
}

function updateConfigFile(ip) {
  const configPath = path.join(__dirname, '..', 'config', 'api.js');
  
  try {
    let content = fs.readFileSync(configPath, 'utf8');
    
    // Tìm và thay thế dòng MANUAL_IP (match cả single và double quotes, và comment sau đó)
    const ipRegex = /const MANUAL_IP = ['"]([^'"]+)['"];(\s*\/\/[^\n]*)?/;
    const newLine = `const MANUAL_IP = '${ip}'; // ⚠️ AUTO-UPDATED: IP của máy chạy backend (tự động cập nhật)`;
    
    if (ipRegex.test(content)) {
      content = content.replace(ipRegex, newLine);
      fs.writeFileSync(configPath, content, 'utf8');
      console.log(`✅ Đã cập nhật MANUAL_IP thành: ${ip}`);
      return true;
    } else {
      console.warn('⚠️  Không tìm thấy dòng MANUAL_IP trong config/api.js');
      console.warn('💡 Vui lòng kiểm tra format của dòng MANUAL_IP trong config/api.js');
      return false;
    }
  } catch (error) {
    console.error('❌ Lỗi khi cập nhật config:', error.message);
    return false;
  }
}

function main() {
  console.log('🔍 Đang tự động phát hiện IP của máy tính...');
  
  const ip = getLocalIP();
  
  if (!ip) {
    console.error('❌ Không tìm thấy IP hợp lệ!');
    console.log('💡 Hãy kiểm tra kết nối mạng của bạn.');
    process.exit(1);
  }
  
  console.log(`📍 Phát hiện IP: ${ip}`);
  console.log('');
  
  // Kiểm tra xem IP có thay đổi không
  const configPath = path.join(__dirname, '..', 'config', 'api.js');
  try {
    const content = fs.readFileSync(configPath, 'utf8');
    const match = content.match(/const MANUAL_IP = ['"]([^'"]+)['"];/);
    
    if (match && match[1] === ip) {
      console.log(`✅ IP đã đúng (${ip}), không cần cập nhật.`);
      return;
    }
  } catch (error) {
    // File không tồn tại hoặc lỗi đọc, tiếp tục cập nhật
  }
  
  // Cập nhật IP vào config
  if (updateConfigFile(ip)) {
    console.log('');
    console.log('💡 IP đã được cập nhật tự động!');
    console.log('💡 Bạn có thể start app ngay bây giờ.');
  } else {
    console.log('');
    console.log('⚠️  Vui lòng cập nhật thủ công MANUAL_IP trong config/api.js');
  }
}

main();

