import { useEffect, useState, createContext, useContext } from 'react'
import { ConfigProvider } from 'antd';
import { IntlProvider } from "react-intl";
import de_DE from "./lang/de-DE.json";
import en_US from "./lang/en-US.json";
import es_ES from "./lang/es-ES.json";
import fr_FR from "./lang/fr-FR.json";
import it_IT from "./lang/it-IT.json";
import ja_JP from "./lang/ja-JP.json";
import pt_PT from "./lang/pt-PT.json";
import zh_CN from "./lang/zh-CN.json";

import deDE from "antd/locale/de_DE";
import enUS from "antd/locale/en_US";
import esES from "antd/locale/es_ES";
import frFR from "antd/locale/fr_FR";
import itIT from "antd/locale/it_IT";
import jaJP from "antd/locale/ja_JP";
import ptPT from "antd/locale/pt_PT";
import zhCN from "antd/locale/zh_CN";

export const langList = ["ar-EG","az-AZ","bg-BG","bn-BD","ca-ES","cs-CZ","da-DK","de-DE","el-GR","en-US","es-ES","et-EE","fa-IR","fi-FI","fr-FR","ga-IE","gl-ES","he-IL","hi-IN","hr-HR","hu-HU","hy-AM","id-ID","is-IS","it-IT","ja-JP","ka-GE","kk-KZ","km-KH","kn-IN","ko-KR","lt-LT","lv-LV","mk-MK","ml-IN","mn-MN","ms-MY","my-MM","ne-NP","nl-BE","nl-NL","pl-PL","pt-BR","pt-PT","ro-RO","ru-RU","si-LK","sk-SK","sl-SI","sr-RS","sv-SE","ta-IN","th-TH","tr-TR","uk-UA","ur-PK","uz-UZ","vi-VN","zh-CN"]

const LanguageContext = createContext(
    () => []
);

export function useLanguage() {
    return useContext(LanguageContext);
}

export const langMap = new Map([
    ["de-DE", [deDE, de_DE]],
    ["en-US", [enUS, en_US]],
    ["es-ES", [esES, es_ES]],
    ["fr-FR", [frFR, fr_FR]],
    ["it-IT", [itIT, it_IT]],
    ["ja-JP", [jaJP, ja_JP]],
    ["pt-PT", [ptPT, pt_PT]],
    ["zh-CN", [zhCN, zh_CN]],
  ]);
export default function LanguageProvider({ children }) {
    
    let nlang = navigator.language;
    let [nlangJSON, nlocale] = langMap.get(nlang) || ((nlang = "en-US") && [enUS, en_US]);

    const [lang, setLang] = useState(nlang);
    const [langJson, setLangJson] = useState(nlangJSON);
    const [locale, setLocale] = useState(nlocale);

    useEffect(() => {
        let [locale, txt] = langMap.get(lang) || [enUS, en_US];
        setLocale(locale);
        setLangJson(txt);
    }, [lang]);

    return (
        <>
            <LanguageContext.Provider value={[lang, setLang]}>
                <ConfigProvider locale={locale} >
                    <IntlProvider locale={lang} messages={langJson}>
                        {children}
                    </IntlProvider>
                </ConfigProvider>
            </LanguageContext.Provider>
        </>
    )
}