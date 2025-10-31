"""Core modules for EmoAI backend"""
import sys
import os

# 确保父目录（src）在 sys.path 中，以便正确导入
src_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if src_dir not in sys.path:
    sys.path.insert(0, src_dir)

from . import emotion_module
from . import agent_module
from . import meta_module
from . import rag_module

__all__ = [
    'emotion_module',
    'agent_module',
    'meta_module',
    'rag_module',
]
