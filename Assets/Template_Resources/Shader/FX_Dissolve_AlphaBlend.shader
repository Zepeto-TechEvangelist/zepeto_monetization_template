// Made with Amplify Shader Editor
// Available at the Unity Asset Store - http://u3d.as/y3X 
Shader "Particle/FX_Dissolve_AlphaBlend"
{
	Properties
	{
		_Dissolve_Texture("Dissolve_Texture", 2D) = "white" {}
		_Dissolve("Dissolve", Range( 0 , 1)) = 0.46
		_Dissolve_Burn("Dissolve_Burn", Float) = 1
		_Thickness("Thickness", Range( -0.15 , 0.15)) = 0.07
		_Dissolve_Color("Dissolve_Color", Color) = (1,0,0,1)
		[Toggle]_Use_CustomData("Use_CustomData", Float) = 0
		_Main_Texture("Main_Texture", 2D) = "white" {}
		_Main_Color("Main_Color", Color) = (1,1,1,1)
		_Main_Burn("Main_Burn", Float) = 1
		[HideInInspector] _tex3coord3( "", 2D ) = "white" {}
		[HideInInspector] _texcoord( "", 2D ) = "white" {}
		[HideInInspector] __dirty( "", Int ) = 1
	}

	SubShader
	{
		Tags{ "RenderType" = "Transparent"  "Queue" = "AlphaTest+0" "IsEmissive" = "true"  }
		Cull Back
		ZWrite Off
		Blend SrcAlpha OneMinusSrcAlpha , SrcAlpha OneMinusSrcAlpha
		
		CGPROGRAM
		#pragma target 2.0
		#pragma surface surf Unlit keepalpha noshadow 
		#undef TRANSFORM_TEX
		#define TRANSFORM_TEX(tex,name) float4(tex.xy * name##_ST.xy + name##_ST.zw, tex.z, tex.w)
		struct Input
		{
			float2 uv_texcoord;
			float4 vertexColor : COLOR;
			float3 uv3_tex3coord3;
		};

		uniform float _Main_Burn;
		uniform float4 _Main_Color;
		uniform sampler2D _Main_Texture;
		uniform float4 _Main_Texture_ST;
		uniform float4 _Dissolve_Color;
		uniform float _Use_CustomData;
		uniform float _Dissolve_Burn;
		uniform float _Thickness;
		uniform sampler2D _Dissolve_Texture;
		uniform float4 _Dissolve_Texture_ST;
		uniform float _Dissolve;

		inline half4 LightingUnlit( SurfaceOutput s, half3 lightDir, half atten )
		{
			return half4 ( 0, 0, 0, s.Alpha );
		}

		void surf( Input i , inout SurfaceOutput o )
		{
			float2 uv_Main_Texture = i.uv_texcoord * _Main_Texture_ST.xy + _Main_Texture_ST.zw;
			float4 tex2DNode41 = tex2D( _Main_Texture, uv_Main_Texture );
			float2 uv_Dissolve_Texture = i.uv_texcoord * _Dissolve_Texture_ST.xy + _Dissolve_Texture_ST.zw;
			float temp_output_17_0 = ( ( tex2D( _Dissolve_Texture, uv_Dissolve_Texture ).r + lerp(_Dissolve,i.uv3_tex3coord3.x,_Use_CustomData) ) - 0.0 );
			float temp_output_20_0 = floor( ( _Thickness + temp_output_17_0 ) );
			float4 temp_cast_0 = (0.0).xxxx;
			float4 temp_cast_1 = (10.0).xxxx;
			float4 clampResult53 = clamp( ( _Dissolve_Color * ( lerp(_Dissolve_Burn,i.uv3_tex3coord3.y,_Use_CustomData) * ( temp_output_20_0 - floor( temp_output_17_0 ) ) ) ) , temp_cast_0 , temp_cast_1 );
			o.Emission = ( ( _Main_Burn * ( _Main_Color * ( tex2DNode41 * i.vertexColor ) ) ) + clampResult53 ).rgb;
			float4 temp_cast_3 = (0.0).xxxx;
			float4 temp_cast_4 = (10.0).xxxx;
			float4 clampResult56 = clamp( ( tex2DNode41 * ( temp_output_20_0 * i.vertexColor.a ) ) , temp_cast_3 , temp_cast_4 );
			o.Alpha = clampResult56.r;
		}

		ENDCG
	}
	CustomEditor "ASEMaterialInspector"
}
/*ASEBEGIN
Version=17000
2616;52;2219;1263;4421.966;1723.625;1.941067;True;True
Node;AmplifyShaderEditor.RangedFloatNode;11;-3199.802,42.91024;Float;True;Property;_Dissolve;Dissolve;3;0;Create;True;0;0;False;0;0.46;0.8355354;0;1;0;1;FLOAT;0
Node;AmplifyShaderEditor.TextureCoordinatesNode;36;-3174.592,298.6556;Float;False;2;-1;3;3;2;SAMPLER2D;;False;0;FLOAT2;1,1;False;1;FLOAT2;0,0;False;5;FLOAT3;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SamplerNode;1;-2864.234,11.16215;Float;True;Property;_Dissolve_Texture;Dissolve_Texture;1;0;Create;True;0;0;False;0;21627d11060a21946a93276165bd9454;ab21ae87b20e6374eb5854d3fcd386e0;True;0;False;white;Auto;False;Object;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ToggleSwitchNode;38;-2778.197,289.1842;Float;False;Property;_Use_CustomData;Use_CustomData;2;0;Create;True;0;0;False;0;0;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleAddOpNode;15;-2543.794,152.8822;Float;False;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;16;-2809.53,-252.9787;Float;False;Property;_Thickness;Thickness;5;0;Create;True;0;0;False;0;0.07;0.1059412;-0.15;0.15;0;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleSubtractOpNode;17;-2399.313,115.2934;Float;True;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleAddOpNode;18;-2205.828,-123.4;Float;True;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.FloorOpNode;21;-2159.177,334.4149;Float;False;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.FloorOpNode;20;-1961.631,9.033237;Float;False;1;0;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;23;-2000.649,-291.6614;Float;False;Property;_Dissolve_Burn;Dissolve_Burn;4;0;Create;True;0;0;False;0;1;1;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleSubtractOpNode;22;-1957.654,219.5472;Float;True;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SamplerNode;41;-1102.969,-388.4571;Float;True;Property;_Main_Texture;Main_Texture;7;0;Create;True;0;0;False;0;9438e7af5347eaa448c6aad37f252544;48c0bdba67bb6e5409df2cd1babc3485;True;0;False;white;Auto;False;Object;-1;Auto;Texture2D;6;0;SAMPLER2D;;False;1;FLOAT2;0,0;False;2;FLOAT;0;False;3;FLOAT2;0,0;False;4;FLOAT2;0,0;False;5;FLOAT;1;False;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.VertexColorNode;2;-1146.46,324.6895;Float;False;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ToggleSwitchNode;40;-1817.521,-168.1519;Float;False;Property;_Use_CustomData;Use_CustomData;6;0;Create;True;0;0;False;0;0;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;24;-1569.212,93.80925;Float;True;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.ColorNode;34;-826.1418,-651.8344;Float;False;Property;_Main_Color;Main_Color;8;0;Create;True;0;0;False;0;1,1,1,1;0.7169812,0.267177,0.3718791,1;True;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.ColorNode;26;-1375.089,-243.5532;Float;False;Property;_Dissolve_Color;Dissolve_Color;6;0;Create;True;0;0;False;0;1,0,0,1;0.5487104,0.5566038,0.07088822,1;True;0;5;COLOR;0;FLOAT;1;FLOAT;2;FLOAT;3;FLOAT;4
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;51;-755.4844,-275.7302;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.RangedFloatNode;55;-830.8873,496.7697;Float;False;Constant;_Max;Max;11;0;Create;True;0;0;False;0;10;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.RangedFloatNode;54;-827.2874,416.3697;Float;False;Constant;_Min;Min;11;0;Create;True;0;0;False;0;0;0;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;29;-668.7632,281.4203;Float;False;2;2;0;FLOAT;0;False;1;FLOAT;0;False;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;27;-1098.168,9.906975;Float;True;2;2;0;COLOR;0,0,0,0;False;1;FLOAT;0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;47;-542.2175,-374.8532;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.RangedFloatNode;49;-524.017,-495.5606;Float;False;Property;_Main_Burn;Main_Burn;9;0;Create;True;0;0;False;0;1;1;0;0;0;1;FLOAT;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;48;-476.211,125.7827;Float;False;2;2;0;COLOR;0,0,0,0;False;1;FLOAT;0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleMultiplyOpNode;50;-315.6324,-344.7782;Float;False;2;2;0;FLOAT;0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.ClampOpNode;53;-408.0874,-146.8303;Float;False;3;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;2;COLOR;1,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.ClampOpNode;56;-289.743,208.7075;Float;False;3;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;2;COLOR;1,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.SimpleAddOpNode;45;-220.5165,-37.42787;Float;False;2;2;0;COLOR;0,0,0,0;False;1;COLOR;0,0,0,0;False;1;COLOR;0
Node;AmplifyShaderEditor.StandardSurfaceOutputNode;9;0,0;Float;False;True;0;Float;ASEMaterialInspector;0;0;Unlit;Particle/FX_Dissolve_AlphaBlend;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;False;Back;2;False;-1;0;False;-1;False;0;False;-1;0;False;-1;False;0;Custom;0.5;True;False;0;True;Transparent;;AlphaTest;All;True;True;True;True;True;True;True;True;True;True;True;True;True;True;True;True;True;0;False;-1;False;0;False;-1;255;False;-1;255;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;0;False;-1;False;2;15;10;25;False;0.5;False;2;5;False;-1;10;False;-1;2;5;False;-1;10;False;-1;0;False;-1;0;False;-1;0;False;0;0,0,0,0;VertexOffset;True;False;Cylindrical;False;Relative;0;;0;-1;-1;-1;0;False;0;0;False;-1;-1;0;False;-1;0;0;0;False;0.1;False;-1;0;False;-1;15;0;FLOAT3;0,0,0;False;1;FLOAT3;0,0,0;False;2;FLOAT3;0,0,0;False;3;FLOAT;0;False;4;FLOAT;0;False;6;FLOAT3;0,0,0;False;7;FLOAT3;0,0,0;False;8;FLOAT;0;False;9;FLOAT;0;False;10;FLOAT;0;False;13;FLOAT3;0,0,0;False;11;FLOAT3;0,0,0;False;12;FLOAT3;0,0,0;False;14;FLOAT4;0,0,0,0;False;15;FLOAT3;0,0,0;False;0
WireConnection;38;0;11;0
WireConnection;38;1;36;1
WireConnection;15;0;1;1
WireConnection;15;1;38;0
WireConnection;17;0;15;0
WireConnection;18;0;16;0
WireConnection;18;1;17;0
WireConnection;21;0;17;0
WireConnection;20;0;18;0
WireConnection;22;0;20;0
WireConnection;22;1;21;0
WireConnection;40;0;23;0
WireConnection;40;1;36;2
WireConnection;24;0;40;0
WireConnection;24;1;22;0
WireConnection;51;0;41;0
WireConnection;51;1;2;0
WireConnection;29;0;20;0
WireConnection;29;1;2;4
WireConnection;27;0;26;0
WireConnection;27;1;24;0
WireConnection;47;0;34;0
WireConnection;47;1;51;0
WireConnection;48;0;41;0
WireConnection;48;1;29;0
WireConnection;50;0;49;0
WireConnection;50;1;47;0
WireConnection;53;0;27;0
WireConnection;53;1;54;0
WireConnection;53;2;55;0
WireConnection;56;0;48;0
WireConnection;56;1;54;0
WireConnection;56;2;55;0
WireConnection;45;0;50;0
WireConnection;45;1;53;0
WireConnection;9;2;45;0
WireConnection;9;9;56;0
ASEEND*/
//CHKSM=7378FCA3C61E109C9BD45DC501EACA2534F995DE