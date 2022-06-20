const functions = require("firebase-functions");
const admin = require('firebase-admin');
const express = require('express');
const request = require('request');

admin.initializeApp();

const db = admin.firestore();

module.exports = {db, functions, express, request};