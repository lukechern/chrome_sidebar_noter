/**
 * 加密管理类
 * 负责笔记的加密、解密、密码验证等功能
 * 使用 Web Crypto API 实现 AES-GCM 加密
 */
class EncryptionManager_7ree {
    constructor() {
        this.key = null;
        this.isAuthenticated = false;
    }

    /**
     * 从密码派生密钥
     * @param {string} password - 用户密码
     * @param {Uint8Array} salt - 盐值（可选，用于已有加密数据）
     */
    async deriveKeyFromPassword(password, salt = null) {
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        
        const saltValue = salt || crypto.getRandomValues(new Uint8Array(16));
        
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            passwordData,
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        const key = await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: saltValue,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );

        return { key, salt: saltValue };
    }

    /**
     * 加密数据
     * @param {string} data - 要加密的字符串数据
     * @param {CryptoKey} key - AES密钥
     */
    async encryptData(data, key) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(data);
        
        const iv = crypto.getRandomValues(new Uint8Array(12));
        
        const encrypted = await crypto.subtle.encrypt(
            {
                name: 'AES-GCM',
                iv: iv
            },
            key,
            dataBuffer
        );

        const encryptedBuffer = new Uint8Array(iv.length + encrypted.byteLength);
        encryptedBuffer.set(iv, 0);
        encryptedBuffer.set(new Uint8Array(encrypted), iv.length);

        return this.arrayBufferToBase64(encryptedBuffer);
    }

    /**
     * 解密数据
     * @param {string} encryptedBase64 - Base64编码的加密数据
     * @param {CryptoKey} key - AES密钥
     */
    async decryptData(encryptedBase64, key) {
        try {
            const encryptedBuffer = this.base64ToArrayBuffer(encryptedBase64);
            
            const iv = encryptedBuffer.slice(0, 12);
            const data = encryptedBuffer.slice(12);

            const decrypted = await crypto.subtle.decrypt(
                {
                    name: 'AES-GCM',
                    iv: iv
                },
                key,
                data
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('解密失败，请检查密码是否正确');
        }
    }

    /**
     * 创建加密笔记包
     * @param {string} content - 笔记内容
     * @param {string} password - 密码
     */
    async createEncryptedNote(content, password) {
        const { key, salt } = await this.deriveKeyFromPassword(password);
        const encryptedContent = await this.encryptData(content, key);
        
        return {
            encrypted: true,
            salt: this.arrayBufferToBase64(salt),
            content: encryptedContent,
            checksum: await this.generateChecksum(content)
        };
    }

    /**
     * 解密笔记包
     * @param {object} encryptedPackage - 加密笔记包
     * @param {string} password - 密码
     */
    async decryptNote(encryptedPackage, password) {
        try {
            const salt = this.base64ToArrayBuffer(encryptedPackage.salt);
            const { key } = await this.deriveKeyFromPassword(password, salt);
            
            const content = await this.decryptData(encryptedPackage.content, key);
            
            const checksum = await this.generateChecksum(content);
            if (checksum !== encryptedPackage.checksum) {
                throw new Error('数据完整性校验失败');
            }

            return content;
        } catch (error) {
            console.error('Note decryption error:', error);
            throw error;
        }
    }

    /**
     * 验证密码是否正确
     * @param {object} encryptedPackage - 加密笔记包
     * @param {string} password - 密码
     */
    async verifyPassword(encryptedPackage, password) {
        try {
            const salt = this.base64ToArrayBuffer(encryptedPackage.salt);
            const { key } = await this.deriveKeyFromPassword(password, salt);
            await this.decryptData(encryptedPackage.content, key);
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * 为加密笔记更改密码
     * @param {object} encryptedPackage - 原加密笔记包
     * @param {string} oldPassword - 原密码
     * @param {string} newPassword - 新密码
     */
    async changePassword(encryptedPackage, oldPassword, newPassword) {
        const content = await this.decryptNote(encryptedPackage, oldPassword);
        return await this.createEncryptedNote(content, newPassword);
    }

    /**
     * 生成内容校验和
     * @param {string} content - 内容
     */
    async generateChecksum(content) {
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return this.arrayBufferToBase64(new Uint8Array(hashBuffer));
    }

    /**
     * ArrayBuffer 转 Base64
     * @param {Uint8Array} buffer - 字节数组
     */
    arrayBufferToBase64(buffer) {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    /**
     * Base64 转 ArrayBuffer
     * @param {string} base64 - Base64字符串
     */
    base64ToArrayBuffer(base64) {
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }
}

// 全局初始化
document.addEventListener('DOMContentLoaded', () => {
    window.encryptionManager_7ree = new EncryptionManager_7ree();
}); 
