const Vendors = {
    openai: {
        url: 'https://api.openai.com/v1/chat/completions',
        model: "gpt-4o-mini"
    }, 
    deepseek: {
        url: 'https://api.deepseek.com/chat/completions',
        model: "deepseek-chat"
    }
}

const CozeWorkflows = {
    TRANSLATE: "7451957951755845658",
    EXPLAIN: "7452151691367120907"
}


const DefaultSystemPrompts = {
    forTranslate: function(language, verbose = false) {
        return `Translate the following text to ${language}. Output the translation only, nothing else.`
    },
    forExplain: function(language) {
        return `
        Role: You are a knowledgeable teacher, skilled in explaining any concept with precise and easily understandable language, while keeping the explanation simple and short. Given the context, please explain the meaning of the specified concept. Please always response in ${language}.

        example:
        language: 
            Chinese
        context:
            you actually have electron humor
        concept:
            electron humor
        output:
            一种以电子及其特性为主题的幽默，通常表现为科学笑话或双关语。这类幽默往往需要一定的科学知识，尤其是对原子和亚原子粒子的理解

        Remember: Always response in ${language}.
        `
    }
}

const DefaultUserPrompts = {
    forTranslate: function(text, context) {
        return `text: ${text}\ntranslation: `;
    },
    forExplain: function(text, context) {
        return `text: ${text}\nexplanation: `;
    }
}


function complete(task, text, context, options, callback) {
    // console.log(`[llm.js] complete: ${text}, ${context}, ${JSON.stringify(options)}`);
    const url = Vendors[options.vendor].url;

    let systemPrompt = "";
    let userPrompt = "";
    
    if (task === 'translate') {

        systemPrompt = DefaultSystemPrompts.forTranslate(options.language);
        if (options.sysPromptTranslate && options.sysPromptTranslate.length > 0) {
            systemPrompt = options.sysPromptTranslate.replace('{{language}}', options.language);
            // console.log(`[llm.js] use custom system prompt: ${systemPrompt}`);
        } else {
            // console.log(`[llm.js] use default system prompt: ${systemPrompt}`);
        }

        userPrompt = DefaultUserPrompts.forTranslate(text, context);
        if (options.userPromptTranslate && options.userPromptTranslate.length > 0) {
            userPrompt = options.userPromptTranslate.replace('{{text}}', text).replace('{{context}}', context);
        }
    } else if (task === 'explain') {

        systemPrompt = DefaultSystemPrompts.forExplain(options.language);
        if (options.sysPromptExplain && options.sysPromptExplain.length > 0) {
            systemPrompt = options.sysPromptExplain.replace('{{language}}', options.language);
        }

        userPrompt = DefaultUserPrompts.forExplain(text, context);
        if (options.userPromptExplain && options.userPromptExplain.length > 0) {
            userPrompt = options.userPromptExplain.replace('{{text}}', text).replace('{{context}}', context);
        }
    }

    // console.log(`[llm.js] systemPrompt: ${systemPrompt}`);
    // console.log(`[llm.js] userPrompt: ${userPrompt}`);

    const payload = {
        model: Vendors[options.vendor].model,
        store: true,
        messages: [
            {
                role: "system",
                content: systemPrompt
            },
            {
                role: "user",
                content: userPrompt
            }
        ]
    };

    fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${options.llmApiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    })
    .then(response => response.json())
    .then(data => {
        // console.log(`[llm.js] complete result: ${JSON.stringify(data)}`);
        callback({
            "success": true,
            "data": data.choices[0].message.content
        });
    })
    .catch((error) => {
        console.error(`[llm.js] complete error: ${error}`);
        callback({
            "success": false,
            "message": error    
        })
    });
}

function translate(text, context, options, callback) {
    if (options.vendor === 'coze') {
        coze_workflow(text, context, options, CozeWorkflows.TRANSLATE, callback);
    } else {
        complete("translate", text, context, options, callback);
    }
}

function explain(text, context, options, callback) {
    if (options.vendor === 'coze') {
        coze_workflow(text, context, options, CozeWorkflows.EXPLAIN, callback);
    } else {
        complete("explain", text, context, options, callback);
    }
}

async function coze_workflow(text, context, options, workflowId,callback) {
    console.log(`[llm.js] coze_workflow: ${text}, ${context}, ${options}, ${workflowId}`);
    const cozeResponse = await fetch('https://api.coze.cn/v1/workflow/run', {
        method: 'POST',
        headers: {
        'Authorization': `Bearer ${options.llmApiKey}`,
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            workflow_id: workflowId,
            parameters: { 
                content: text,
                context: context,
                language: options.language
            }
        })
    });
    console.log(`[llm.js] coze response: ${JSON.stringify(cozeResponse)}`);
    const cozeData = await cozeResponse.json();
    console.log(`[llm.js] coze data: ${JSON.stringify(cozeData)}`);
    const data = cozeData.data;
    // convert string to json
    const jsonData = JSON.parse(data);
    callback(jsonData.output);
}

function lookup(text, context, options, callback) {
    if (options.vendor === 'coze') {
        coze_workflow(text, context, options, CozeWorkflows.TRANSLATE, callback);
    } else {
        complete('translate', text, context, options, callback);
    }
}


