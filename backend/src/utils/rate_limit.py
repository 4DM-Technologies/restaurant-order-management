"""Slowapi limiter singleton — attached to app.state.limiter in main.py."""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
