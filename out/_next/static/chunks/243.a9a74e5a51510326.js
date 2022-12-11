"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[243],{89243:function(e,o,r){r.r(o),r.d(o,{default:function(){return b}});var l=r(41942);r(67294),r(83078);const c=l.b`
    :after {
        background-color: ${(0,l.d)("light",90)};
    }

    :hover {
        :after {
            background-color: ${(0,l.d)("light",70)};
        }
    }

    :active {
        :after {
            background-color: ${(0,l.d)("light",50)};
        }
    }
`,n=l.b`
    background-color: ${l.e.red};
    border-color: ${l.e.red};
    color: ${l.e.red};

    :focus {
        box-shadow: 0px 0px 0px 2px ${l.e.paleCerulean};
    }

    svg {
        fill: ${l.e.red};
    }

    ${c}
`,a=l.b`
    background-color: ${l.e.green};
    border-color: ${l.e.green};
    color: ${l.e.green};

    :focus {
        box-shadow: 0px 0px 0px 2px ${l.e.paleCerulean};
    }

    svg {
        fill: ${l.e.green};
    }

    ${c}
`,t=l.b`
    background-color: ${l.e.blue};
    border-color: ${l.e.blue};
    color: ${l.e.blue};

    :focus {
        box-shadow: 0px 0px 0px 2px ${l.e.paleCerulean};
    }

    svg {
        fill: ${l.e.blue};
    }

    ${c}
`,u=l.b`
    background-color: ${l.e.yellow};
    border-color: ${l.e.yellow};
    color: ${l.e.yellow};

    :focus {
        box-shadow: 0px 0px 0px 2px ${l.e.paleCerulean};
    }

    svg {
        fill: ${l.e.yellow};
    }

    ${c}
`;var d={ButtonColoredStyled:(0,l.f)(l.h)`
    :after {
        background-color: ${(0,l.d)("dark",0)};
        content: '';
        display: block;
        height: 100%;
        left: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        transition: all 0.3s ease;
        width: 100%;
        z-index: 0;
    }

    ${({color:e})=>e&&(e=>{switch(e){case"red":return n;case"green":return a;case"blue":return t;case"yellow":return u;default:return}})(e)}
`};const{ButtonColoredStyled:s}=d,b=({color:e,...o})=>(0,l.i)(s,{color:e,...o})}}]);