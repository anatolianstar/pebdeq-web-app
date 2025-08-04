#!/usr/bin/env python3
import psutil

# Check psutil
memory = psutil.virtual_memory()
print(f"✅ psutil available")
print(f"💾 Total RAM: {memory.total / (1024**3):.1f} GB")
print(f"💾 Available RAM: {memory.available / (1024**3):.1f} GB")
print(f"💾 Used RAM: {memory.percent}%") 