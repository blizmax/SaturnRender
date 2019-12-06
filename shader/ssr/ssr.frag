#version 450

#extension GL_ARB_separate_shader_objects : enable
#extension GL_ARB_shading_language_420pack : enable

layout (binding = 0) uniform UBO 
{
	
    mat4 uPerspective;
    vec3 uWorldExtent;
} ubo;

layout (binding = 1) uniform sampler2D samplerPositionDepth;
layout (binding = 2) uniform sampler2D samplerNormal;


layout (location = 0) in vec2 inUV;
layout (location = 0) out vec4 outFragColor;

// Consts should help improve performance
const float rayStep = 0.25;
const float minRayStep = 0.1;
const float maxSteps = 20;
const float searchDist = 5;
const float searchDistInv = 0.2;
const int numBinarySearchSteps = 5;
const float maxDDepth = 1.0;
const float maxDDepthInv = 1.0;
const float cb_zThickness = 0.00001;
const float reflectionSpecularFalloffExponent = 3.0;


vec4 viewToNDC(vec4 position) {
    vec4 hs = ubo.uPerspective * position;
    return hs / hs.w;
}

vec3 BinarySearch(vec3 dir, inout vec3 hitCoord, out float dDepth)
{
    float depth;


    for(int i = 0; i < numBinarySearchSteps; i++)
    {
        vec4 projectedCoord = ubo.uPerspective * vec4(hitCoord, 1.0);
        projectedCoord.xy /= projectedCoord.w;
        projectedCoord.xy = projectedCoord.xy * 0.5 + 0.5;


        depth = texture(samplerPositionDepth, projectedCoord.xy).z;


        dDepth = hitCoord.z - depth;


        if(dDepth > 0.0)
            hitCoord += dir;


        dir *= 0.5;
        hitCoord -= dir;    
    }


    vec4 projectedCoord = ubo.uPerspective * vec4(hitCoord, 1.0); 
    projectedCoord.xy /= projectedCoord.w;
    projectedCoord.xy = projectedCoord.xy * 0.5 + 0.5;


    return vec3(projectedCoord.xy, depth);
}
vec4 traceScreenSpaceRay(vec3 orig,vec3 dir){

    float step = 0.01;
    vec4 hitInfo = vec4(0.0);
    for(float i = 1.0; i <= 1.0; i++) {
        vec3 samplePoint = orig + dir * step * i;

        vec4 PS = viewToNDC(vec4(samplePoint, 1.0));
        
        float depthAtPS = abs(texture(samplerPositionDepth, PS.xy * 0.5 + 0.5).z);
        hitInfo.xy = PS.xy;
        if(depthAtPS<samplePoint.z)
        {
            hitInfo.xy = PS.xy;
         
        }
    }

    return hitInfo;
}


void main() 
{
	vec4 ssrColor = vec4(1.0,0.,0.,0.);
	vec3 rayOriginVS = texture(samplerPositionDepth, inUV).rgb;
	vec3 normal = normalize(texture(samplerNormal, inUV).rgb * 2.0 - 1.0);
    vec3 toPositionVS   = normalize(rayOriginVS);

    vec3 rayDir =  normalize(reflect(toPositionVS,normal));

    vec2 hitPixel = vec2(0.0f, 0.0f);
    vec3 hitPoint = vec3(0.0f, 0.0f, 0.0f);


    if ( normal.xyz == vec3(0.0)) {
        outFragColor = vec4(0, 0, 0, 1);
        return;
    }
    float vDotN = dot(toPositionVS, normal.xyz);
    
    float step = 0.01;
    vec4 hitInfo = vec4(0.0);
    for(int i = 1; i <= 20; i++) {
        vec3 samplePoint = rayOriginVS + rayDir * step * i;

        vec4 PS = viewToNDC(vec4(samplePoint, 1.0));
        
        float depthAtPS = abs(texture(samplerPositionDepth, PS.xy * 0.5 + 0.5).z);
        hitInfo.xy = PS.xy;
        if(depthAtPS<samplePoint.z)
        {
            hitInfo.xy = PS.xy;
         
        }
    }


	outFragColor = hitInfo;
}
