# PBR Shader Implementation

Complete Cook-Torrance BRDF implementation in Metal Shading Language.

## Material Properties Structure

```metal
struct MaterialProperties {
    float3 albedo;
    float metallic;
    float roughness;
    float ao;           // Ambient occlusion
    float3 emission;
};

struct Light {
    float3 position;
    float3 color;
    float intensity;
};
```

## BRDF Components

### Fresnel-Schlick Approximation

```metal
float3 fresnel_schlick(float cos_theta, float3 F0) {
    return F0 + (1.0 - F0) * pow(1.0 - cos_theta, 5.0);
}
```

### GGX/Trowbridge-Reitz Normal Distribution

```metal
float distribution_ggx(float3 N, float3 H, float roughness) {
    float a = roughness * roughness;
    float a2 = a * a;
    float NdotH = max(dot(N, H), 0.0);
    float NdotH2 = NdotH * NdotH;

    float denom = (NdotH2 * (a2 - 1.0) + 1.0);
    denom = M_PI_F * denom * denom;

    return a2 / denom;
}
```

### Smith's Schlick-GGX Geometry Function

```metal
float geometry_schlick_ggx(float NdotV, float roughness) {
    float r = (roughness + 1.0);
    float k = (r * r) / 8.0;

    return NdotV / (NdotV * (1.0 - k) + k);
}

float geometry_smith(float3 N, float3 V, float3 L, float roughness) {
    float NdotV = max(dot(N, V), 0.0);
    float NdotL = max(dot(N, L), 0.0);
    float ggx1 = geometry_schlick_ggx(NdotV, roughness);
    float ggx2 = geometry_schlick_ggx(NdotL, roughness);

    return ggx1 * ggx2;
}
```

## Complete PBR Lighting Function

```metal
float3 calculate_pbr_lighting(
    float3 world_pos,
    float3 normal,
    float3 view_dir,
    MaterialProperties material,
    Light light
) {
    // Calculate light direction
    float3 light_dir = normalize(light.position - world_pos);
    float3 halfway = normalize(view_dir + light_dir);

    // Distance attenuation
    float distance = length(light.position - world_pos);
    float attenuation = 1.0 / (distance * distance);
    float3 radiance = light.color * light.intensity * attenuation;

    // Cook-Torrance BRDF
    float3 F0 = mix(float3(0.04), material.albedo, material.metallic);
    float3 F = fresnel_schlick(max(dot(halfway, view_dir), 0.0), F0);

    float NDF = distribution_ggx(normal, halfway, material.roughness);
    float G = geometry_smith(normal, view_dir, light_dir, material.roughness);

    float3 numerator = NDF * G * F;
    float denominator = 4.0 * max(dot(normal, view_dir), 0.0) *
                        max(dot(normal, light_dir), 0.0) + 0.0001;
    float3 specular = numerator / denominator;

    // Energy conservation
    float3 kS = F;
    float3 kD = (1.0 - kS) * (1.0 - material.metallic);

    float NdotL = max(dot(normal, light_dir), 0.0);

    return (kD * material.albedo / M_PI_F + specular) * radiance * NdotL;
}
```

## Fragment Shader

```metal
fragment float4 pbr_fragment(
    VertexOut in [[stage_in]],
    constant MaterialProperties& material [[buffer(0)]],
    constant Light* lights [[buffer(1)]],
    constant uint& light_count [[buffer(2)]],
    constant float3& camera_pos [[buffer(3)]]
) {
    float3 normal = normalize(in.world_normal);
    float3 view_dir = normalize(camera_pos - in.world_position);

    // Accumulate lighting from all lights
    float3 Lo = float3(0.0);
    for (uint i = 0; i < light_count; i++) {
        Lo += calculate_pbr_lighting(
            in.world_position,
            normal,
            view_dir,
            material,
            lights[i]
        );
    }

    // Ambient lighting (simplified IBL)
    float3 ambient = float3(0.03) * material.albedo * material.ao;
    float3 color = ambient + Lo + material.emission;

    // HDR tone mapping (Reinhard)
    color = color / (color + float3(1.0));

    // Gamma correction
    color = pow(color, float3(1.0/2.2));

    return float4(color, 1.0);
}
```

## Key Concepts

### Cook-Torrance BRDF
The specular term: `(D * G * F) / (4 * NdotV * NdotL)`
- **D**: Normal Distribution Function (GGX)
- **G**: Geometry Function (Smith)
- **F**: Fresnel (Schlick approximation)

### Energy Conservation
`kD = (1 - kS) * (1 - metallic)`
- Metals have no diffuse component
- Total reflected energy never exceeds incoming

### F0 Values
- Dielectrics: ~0.04 (plastic, fabric, skin)
- Metals: Use albedo as F0
- `F0 = mix(0.04, albedo, metallic)`

## Half-Precision Optimization

For mobile/Apple Silicon, convert to `half` precision:

```metal
half3 fresnel_schlick_half(half cos_theta, half3 F0) {
    return F0 + (half3(1.0h) - F0) * pow(1.0h - cos_theta, 5.0h);
}
```

Only use `float` for:
- World positions
- Depth values
- Cumulative calculations
