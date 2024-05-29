import { css } from "@lesnoypudge/utils";



type Config = Record<string, () => void>;

const styles = css`
    .lesnoypudge-devtools-container {
        padding: 30px;
        color: #efefef;
        background-color: #1e1e1e;
        font-family: monospace, sans-serif;
        position: fixed;
        top: 50%;
        left: 50%;
        translate: -50% -50%;
        font-size: 30px;
        max-width: 90vw;
        max-height: 80vh;
        overflow-y: scroll;
        outline: 4px solid white;
        display: flex;
        flex-direction: column;
        gap: 20px;

        style {
            display: none;
        }

        ul {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        button {
            padding: 10px;
            outline: 2px solid white;
        }

        button:hover {
            background-color: #4b4b4b;
        }

        * {
            all: unset;
            box-sizing: border-box;
        }
    }
`;

const globalStyles = css`
    html[data-outline=true] * {
        box-shadow: inset 0 0 0px 0.5px red, 0 0 0px 0.5px red !important;
    }
`;

const defaultConfig: Config = {
    toggleElementsOutline: () => {
        const currentValue = document.documentElement.dataset.outline;
        if (!currentValue) {
            document.documentElement.dataset.outline = 'true';
            return
        }

        document.documentElement.dataset.outline = (
            currentValue === 'false' ? 'true' : 'false'
        )
    },

    clearConsole: console.clear,

    logElementsCount: () => {
        console.log(`${document.querySelectorAll('*').length} DOM elements`);
    },

    setDarkTheme: () => {
        document.documentElement.dataset.theme = 'dark';
    },

    setLightTheme: () => {
        document.documentElement.dataset.theme = 'light';
    },

    setAutoTheme: () => {
        document.documentElement.dataset.theme = 'auto';
    },
};


const init = (() => {
    let isInit = false;

    return () => {
        if (isInit) return;
        isInit = true;
        const globalStyle = document.createElement('style');
        globalStyle.textContent = globalStyles;
        document.body.appendChild(globalStyle)
    }
})();

export const devtools = (
    root: HTMLElement,
    onClose: () => void,
    config: Config = {},
) => {
    config = Object.assign({}, defaultConfig, config);
    init();
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'close devtools';
    closeButton.tabIndex = -1;
    closeButton.addEventListener('click', onClose);

    const container = document.createElement('div');
    container.className = 'lesnoypudge-devtools-container';
    container.ariaHidden = 'true';
    container.appendChild(closeButton);

    const list = document.createElement('ul');
    const style = document.createElement('style');
    style.textContent = styles;

    const options = Object.entries(config).map(([key, fn]) => {
        const option = document.createElement('li')
        const button = document.createElement('button')

        button.textContent = key;
        button.tabIndex = -1;
        button.addEventListener('click', fn);
        option.appendChild(button);

        return {
            option, 
            button, 
            fn
        };
    })

    list.append(...options.map((({option}) => option)))
    
    container.appendChild(style);
    
    (
        options.length
            ? container.appendChild(list)
            : container.appendChild((() => {
                const placeholder = document.createElement('span')
                placeholder.textContent = 'No options found';
                return placeholder;
            })())
    );

    
    root.appendChild(container)

    return () => {
        root.removeChild(container);
        closeButton.removeEventListener('click', onClose)

        options.forEach((item) => {
            item.button.removeEventListener('click', item.fn)
        })
    }
}