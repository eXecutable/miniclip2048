#version 300 es

precision mediump float;

uniform vec4 uGlobalColor;

out vec4 outColor;

void main() {
    outColor = uGlobalColor;
}