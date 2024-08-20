#version 300 es 
precision mediump float;

in vec2 v_uv;
in vec3 v_color;
in float v_grayscale;

uniform sampler2D u_texture;

out vec4 f_color;

void main() {
    if (v_grayscale == 1.0) {
        vec4 color = texture(u_texture, v_uv);
        float gray = sqrt(dot(pow(color.rgb, vec3(2.0)), vec3(0.2126, 0.7152, 0.0722)));
        f_color = vec4(gray, gray, gray, color.a) * vec4(v_color, color.a);
        return;
    }
    f_color = texture(u_texture, v_uv) * vec4(v_color, 1.0f);
}