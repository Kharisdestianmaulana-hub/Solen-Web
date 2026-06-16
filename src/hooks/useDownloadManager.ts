import { useCallback } from 'react';
import { useBrowserStore, DownloadItem } from '../store/useBrowserStore';
import { save } from '@tauri-apps/plugin-dialog';
import { download } from '@tauri-apps/plugin-upload';

export function useDownloadManager() {
  const { downloadPath, addDownload, updateDownload } = useBrowserStore();

  const startDownload = useCallback(async (url: string, suggestedFilename: string) => {
    let downloadId = Math.random().toString(36).substring(2, 9);
    try {
      // 1. Pick save path
      const savePath = await save({
        defaultPath: downloadPath ? `${downloadPath}/${suggestedFilename}` : suggestedFilename,
      });

      if (!savePath) {
        // User cancelled
        return;
      }

      // 2. Create download item
      const newDownload: DownloadItem = {
        id: downloadId,
        filename: suggestedFilename,
        url,
        savePath,
        progress: 0,
        total: 0,
        status: 'downloading',
        createdAt: Date.now()
      };
      
      addDownload(newDownload);

      // 3. Start download via tauri-plugin-upload
      await download(url, savePath, (progressData) => {
        const pct = progressData.total > 0 
          ? Math.round((progressData.progress / progressData.total) * 100) 
          : 0;
          
        updateDownload(downloadId, { 
          progress: pct,
          total: progressData.total
        });
      });

      // 4. Mark completed
      updateDownload(downloadId, { status: 'completed', progress: 100 });

    } catch (err: any) {
      console.error('Download error:', err);
      updateDownload(downloadId, { status: 'error', error: err.toString() });
    }
  }, [downloadPath, addDownload, updateDownload]);

  return { startDownload };
}
