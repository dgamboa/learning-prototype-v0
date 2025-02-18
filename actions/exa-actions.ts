"use server"

import { ActionState } from "@/types"
import Exa from "exa-js"

const exa = new Exa(process.env.EXA_API_KEY)

export async function searchExaAction(userQuery: string): Promise<
    ActionState<
        {
            results: {
                title: string,
                url: string,
                text: string,
                summary: string,
            }[]
        }
    >
> {
    try {
        const exaResponse = await exa.searchAndContents(userQuery, {
            type: "neural",
            useAutoprompt: true,
            numResults: 5,
            text: true,
            livecrawl: "always",
            summary: true,
        })

        const formattedResults = {
            results: exaResponse.results.map((r) => ({
              title: r.title || "",
              url: r.url,
              text: r.text,
              summary: r.summary
            }))
          };
        
        return { 
            isSuccess: true,
            message: "Search successful",
            data: formattedResults
        }
    } catch (error) {
        return { isSuccess: false, message: "Exa search failed" }
    }
}