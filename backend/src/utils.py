# utils.py - 兼容层，重新导出 utils/tools.py 中的函数
import sys
import os

# 确保 utils 包可以被导入
utils_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'utils')
if utils_dir not in sys.path:
    sys.path.insert(0, utils_dir)

from utils.tools import (
    safe_text,
    safe_batch,
    chunk_text,
    log_emotion_entry,
    read_emotion_log,
)

__all__ = [
    'safe_text',
    'safe_batch',
    'chunk_text',
    'log_emotion_entry',
    'read_emotion_log',
]
