/**
 * File utility functions for the project files feature
 */

import {
    File,
    FileImage,
    FileVideo,
    FileAudio,
    FileText,
    FileCode,
    FileSpreadsheet,
    FileArchive,
} from 'lucide-react';

/**
 * Get the file extension from a filename
 */
export function getFileExtension(filename: string): string {
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop()?.toLowerCase() || '' : '';
}

/**
 * Get the appropriate icon component for a file type
 */
export function getFileIcon(extension: string) {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'];
    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];
    const audioExts = ['mp3', 'wav', 'ogg', 'flac', 'm4a'];
    const codeExts = ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'scss', 'html', 'json', 'xml', 'yaml', 'yml', 'sh', 'bash', 'go', 'rs', 'rb', 'php'];
    const spreadsheetExts = ['xls', 'xlsx', 'csv', 'ods'];
    const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'];
    const textExts = ['txt', 'md', 'rtf', 'doc', 'docx', 'pdf'];

    if (imageExts.includes(extension)) return FileImage;
    if (videoExts.includes(extension)) return FileVideo;
    if (audioExts.includes(extension)) return FileAudio;
    if (codeExts.includes(extension)) return FileCode;
    if (spreadsheetExts.includes(extension)) return FileSpreadsheet;
    if (archiveExts.includes(extension)) return FileArchive;
    if (textExts.includes(extension)) return FileText;

    return File;
}

/**
 * Format file size to human readable string
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Get file category from extension
 */
export function getFileCategory(extension: string): string {
    const categories: Record<string, string[]> = {
        'Image': ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'],
        'Video': ['mp4', 'webm', 'mov', 'avi', 'mkv'],
        'Audio': ['mp3', 'wav', 'ogg', 'flac', 'm4a'],
        'Code': ['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'h', 'css', 'scss', 'html', 'json', 'xml', 'yaml', 'yml', 'sh', 'go', 'rs', 'rb', 'php'],
        'Document': ['txt', 'md', 'rtf', 'doc', 'docx', 'pdf'],
        'Spreadsheet': ['xls', 'xlsx', 'csv', 'ods'],
        'Archive': ['zip', 'rar', '7z', 'tar', 'gz', 'bz2'],
    };

    for (const [category, exts] of Object.entries(categories)) {
        if (exts.includes(extension)) return category;
    }

    return 'Other';
}

/**
 * Get category badge color
 */
export function getCategoryColor(category: string): string {
    const colors: Record<string, string> = {
        'Image': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
        'Video': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
        'Audio': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
        'Code': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
        'Document': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
        'Spreadsheet': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
        'Archive': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    };

    return colors[category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
}

/**
 * Check if file can be previewed in browser
 */
export function canPreviewFile(extension: string): boolean {
    const previewableExts = [
        // Images
        'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
        // Videos
        'mp4', 'webm',
        // Audio
        'mp3', 'wav', 'ogg',
        // Documents
        'pdf', 'txt', 'md',
        // Code
        'js', 'jsx', 'ts', 'tsx', 'py', 'java', 'c', 'cpp', 'css', 'html', 'json', 'xml', 'yaml', 'yml',
    ];

    return previewableExts.includes(extension);
}
