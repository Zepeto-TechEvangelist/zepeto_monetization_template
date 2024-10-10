Shader "Particle/AlphaBlended (UVScroll Rotation Scale)"
{
    Properties
    {
        _MainTex("MainTex", 2D) = "white" {}
        _TintColor("Color", Color) = (0.5, 0.5, 0.5, 1)
        _ScrollX("ScrollX", Range(-100, 100)) = 0
        _ScrollY("ScrollY", Range(-100, 100)) = 0
        _Angle("Angle", Range(-1, 1)) = 0
        _AngleSpeed("AngleSpeed", Float ) = 1
        _Scale("Scale", Float ) = 1
    }
    
    Category
    {
        Tags {"Queue" = "Transparent" "IgnoreProjector" = "True" "RenderType" = "Transparent"}
        Blend SrcAlpha OneMinusSrcAlpha
        Lighting Off ZWrite Off Fog {Color(0, 0, 0, 0)}
        
        SubShader
        {
            Pass
            {
                CGPROGRAM
                #pragma vertex vert
                #pragma fragment frag
                #include "UnityCG.cginc"

                struct appdata
                {
                    float4 vertex : POSITION;
                    float2 uv : TEXCOORD0;
                };

                struct v2f
                {
                    float2 uv : TEXCOORD0;
                    float4 vertex : SV_POSITION;
                };

                uniform sampler2D _MainTex;
                uniform float4 _MainTex_ST;
                uniform fixed4 _TintColor;
                uniform float _ScrollX;
                uniform float _ScrollY;
                uniform float _Angle;
                uniform float _AngleSpeed;
                uniform float _Scale;

                v2f vert (appdata v)
                {
                    v2f o;
                    o.vertex = UnityObjectToClipPos(v.vertex);
                    o.uv = v.uv;
                    return o;
                }

                fixed4 frag(v2f i) : SV_TARGET
                {
                    float t = _Time.r;
                    float2 pivot = float2(0.5,0.5);
                    float r = (_Angle * 6.28) * (_AngleSpeed * t);
                    float _cos = cos(r);
                    float _sin = sin(r);
                    float2 _uv = (mul(((_Scale*(((i.uv+(_ScrollX*t)*float2(1,0))+(_ScrollY*t)*float2(0,1))*1.0+-0.5))+pivot)-pivot,float2x2(_cos,-_sin,_sin,_cos))+pivot);
                    float4 _MainTex_var = tex2D(_MainTex,TRANSFORM_TEX(_uv, _MainTex));
                    return _MainTex_var * _TintColor * 2;
                }

                ENDCG
            }
        }
    }
}
