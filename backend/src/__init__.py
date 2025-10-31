"""
EmoAI Backend Module
This __init__.py ensures backward compatibility for imports.
"""
import sys
import os

# 确保 src 目录在 Python path 中
src_path = os.path.dirname(os.path.abspath(__file__))
if src_path not in sys.path:
    sys.path.insert(0, src_path)

__all__ = [
    'config',
    'state',
    'app',
    'main',
    'core',
]
