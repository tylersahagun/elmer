import json
import sys
try:
    from composio_workbench import run_composio_tool
except ImportError:
    print("composio_workbench not found. Ensure it is installed.", file=sys.stderr)
    sys.exit(1)

def search_notion_page(query):
    args = {"query": query, "page_size": 10}
    resp, err = run_composio_tool("NOTION_SEARCH_NOTION_PAGE", args)
    if err:
        raise Exception(f"Search failed: {err}")
    
    data = resp.get("data", resp)
    if isinstance(data, dict) and "data" in data:
        data = data["data"]
        
    results = data.get("results", [])
    
    # Filter for exact match or close match
    for res in results:
        # Notion title structure is nested
        props = res.get("properties", {})
        title_prop = None
        for k, v in props.items():
            if v.get("id") == "title":
                title_prop = v
                break
        
        if title_prop and "title" in title_prop:
            title_text = "".join([t.get("plain_text", "") for t in title_prop["title"]])
            if "Product Home" in title_text or "Product" in title_text:
                return res.get("id"), title_text
    
    # fallback, just return first result if any
    if results:
        return results[0].get("id"), "First Result"
        
    return None, None

def create_container(parent_id, title):
    args = {
        "parent_id": parent_id,
        "title": title,
        "icon": "📁"
    }
    resp, err = run_composio_tool("NOTION_CREATE_NOTION_PAGE", args)
    if err:
        print(f"Error creating {title}: {err}")
        return None
    
    data = resp.get("data", resp)
    if isinstance(data, dict) and "data" in data:
        data = data["data"]
        
    return data.get("id")

if __name__ == "__main__":
    print("Searching for Product Home...")
    parent_id, title = search_notion_page("Product Home")
    
    if not parent_id:
        print("Could not find Product Home.")
        sys.exit(1)
        
    print(f"Found parent: {title} (ID: {parent_id})")
    
    containers = [
        "Definition",
        "Feedback & Signals",
        "Strategy & Context",
        "Templates",
        "Archive"
    ]
    
    results = {}
    for c in containers:
        print(f"Creating container: {c}...")
        c_id = create_container(parent_id, c)
        results[c] = c_id
        
    print(json.dumps(results, indent=2))
