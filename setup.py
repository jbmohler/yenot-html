#!/usr/bin/env python

from distutils.core import setup

setup(
    name="yenothtml",
    version="0.1",
    description="Yenot SPA",
    author="Joel B. Mohler",
    author_email="joel@kiwistrawberry.us",
    url="https://bitbucket.org/jbmohler/yenot-html",
    packages=["yenothtml"],
    package_data={"yenothtml": ["static/*"]},
    install_requires=["yenot"],
)
