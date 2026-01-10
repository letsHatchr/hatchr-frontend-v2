/**
 * File types for the project files feature
 */

export interface ProjectFile {
    _id: string;
    project: string;
    originalFileName: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    r2Key: string;
    uploadedBy: {
        _id: string;
        name: string;
        username: string;
        avatar?: string;
    };
    downloadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface FilesResponse {
    success: boolean;
    files: ProjectFile[];
    pagination: {
        page: number;
        pages: number;
        total: number;
        limit: number;
    };
}

export interface FileDownloadResponse {
    success: boolean;
    downloadUrl: string;
}

export interface FileContentResponse {
    success: boolean;
    content: string;
    fileName: string;
    fileType: string;
    fileSize: number;
}
